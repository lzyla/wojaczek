import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Compass, LocateFixed, X } from 'lucide-react';
import type { Point } from '../../types';

const DEFAULT_RADIUS_METERS = 75;
const LOCK_HEADING_DEGREES = 30;
const LOCK_DELAY_MS = 900;

type DeviceOrientationWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type DeviceOrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBearing(lat1: number, lng1: number, lat2: number, lng2: number) {
  const startLat = lat1 * Math.PI / 180;
  const startLng = lng1 * Math.PI / 180;
  const endLat = lat2 * Math.PI / 180;
  const endLng = lng2 * Math.PI / 180;
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function getHeadingDelta(heading: number, target: number) {
  const diff = Math.abs(heading - target) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface FloatingLineProps {
  text: string;
  index: number;
  isLocked: boolean;
  isRevealed: boolean;
  parallaxX: number;
  parallaxY: number;
  accentColor: string;
}

const FloatingLine = ({
  text,
  index,
  isLocked,
  isRevealed,
  parallaxX,
  parallaxY,
  accentColor,
}: FloatingLineProps) => {
  const letters = Array.from(text);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{
        opacity: isLocked ? 1 : 0.45,
        y: isLocked ? 0 : 14,
        x: isLocked ? [0, 8, -4, 0] : [0, 18, -12, 0],
      }}
      transition={{
        opacity: { duration: 0.45 },
        y: { duration: 0.45 },
        x: { duration: isLocked ? 6 : 9, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="flex flex-wrap justify-center gap-x-0.5 md:gap-x-1"
      style={{
        transform: `translate3d(${parallaxX * (0.35 + index * 0.08)}px, ${parallaxY * (0.3 + index * 0.06)}px, 0)`,
      }}
    >
      {letters.map((letter, letterIndex) => {
        const letterOffsetX = ((letterIndex % 5) - 2) * 1.8;
        const letterOffsetY = ((letterIndex % 3) - 1) * 1.5;

        return (
          <motion.span
            key={`${text}-${letterIndex}`}
            initial={false}
            animate={{
              opacity: isRevealed ? 1 : 0.42,
              filter: isRevealed ? 'blur(0px)' : 'blur(3px)',
              x: isRevealed ? 0 : letterOffsetX,
              y: isRevealed ? 0 : letterOffsetY,
              color: isRevealed && letterIndex % 5 === 0 ? accentColor : '#f8f3ef',
            }}
            transition={{
              delay: index * 0.18 + letterIndex * 0.028,
              duration: 0.7,
              ease: 'easeOut',
            }}
            className="font-cormorant text-2xl tracking-[0.18em] sm:text-3xl sm:tracking-[0.24em]"
            style={{
              textShadow: '0 0 24px rgba(0, 0, 0, 0.35)',
              whiteSpace: letter === ' ' ? 'pre' : 'normal',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        );
      })}
    </motion.div>
  );
};

interface ArViewProps {
  point: Point;
  onBack: () => void;
}

export const ArView = ({ point, onBack }: ArViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lockTimeoutRef = useRef<number | null>(null);
  const latestPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const latestHeadingRef = useRef<number | null>(null);
  const distanceRef = useRef<number | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [orientationError, setOrientationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [headingDelta, setHeadingDelta] = useState<number | null>(null);
  const [parallaxX, setParallaxX] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const arExperience = point.arExperience;
  const activationRadius = arExperience?.activationRadiusMeters ?? DEFAULT_RADIUS_METERS;
  const accentColor = arExperience?.accentColor ?? '#d44545';

  const handleOrientation = useCallback((event: Event) => {
    const orientationEvent = event as DeviceOrientationWithCompass;
    const beta = orientationEvent.beta ?? 0;
    const gamma = orientationEvent.gamma ?? 0;

    setParallaxX(clamp(gamma / 2.2, -18, 18));
    setParallaxY(clamp((beta - 45) / 2.7, -18, 18));

    let heading: number | null = null;

    if (typeof orientationEvent.webkitCompassHeading === 'number') {
      heading = orientationEvent.webkitCompassHeading;
    } else if (typeof orientationEvent.alpha === 'number') {
      heading = (360 - orientationEvent.alpha + 360) % 360;
    }

    latestHeadingRef.current = heading;

    const currentPosition = latestPositionRef.current;
    const currentDistance = distanceRef.current;
    if (heading === null || currentPosition === null || currentDistance === null) {
      setHeadingDelta(null);
      return;
    }

    if (currentDistance <= 3) {
      setHeadingDelta(0);
      return;
    }

    const targetBearing = getBearing(
      currentPosition.lat,
      currentPosition.lng,
      point.lat,
      point.lng,
    );
    setHeadingDelta(getHeadingDelta(heading, targetBearing));
  }, [point.lat, point.lng]);

  useEffect(() => {
    return () => {
      if (lockTimeoutRef.current) window.clearTimeout(lockTimeoutRef.current);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, [handleOrientation]);

  useEffect(() => {
    if (!hasStarted) return;

    const readyByDistance = distance !== null && distance <= activationRadius;
    const readyByHeading =
      headingDelta === null || headingDelta <= LOCK_HEADING_DEGREES || (distance !== null && distance <= 15);
    const nextLocked = readyByDistance && readyByHeading;

    setIsLocked(nextLocked);
  }, [activationRadius, distance, hasStarted, headingDelta]);

  useEffect(() => {
    if (lockTimeoutRef.current) {
      window.clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }

    if (!isLocked) {
      setIsRevealed(false);
      return;
    }

    lockTimeoutRef.current = window.setTimeout(() => {
      setIsRevealed(true);
    }, LOCK_DELAY_MS);

    return () => {
      if (lockTimeoutRef.current) {
        window.clearTimeout(lockTimeoutRef.current);
        lockTimeoutRef.current = null;
      }
    };
  }, [isLocked]);

  const startGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Ta przeglądarka nie udostępnia lokalizacji.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const current = { lat: coords.latitude, lng: coords.longitude };
        latestPositionRef.current = current;

        const nextDistance = Math.round(
          getDistanceMeters(current.lat, current.lng, point.lat, point.lng),
        );
        distanceRef.current = nextDistance;
        setDistance(nextDistance);

        if (latestHeadingRef.current !== null) {
          const targetBearing = getBearing(current.lat, current.lng, point.lat, point.lng);
          setHeadingDelta(getHeadingDelta(latestHeadingRef.current, targetBearing));
        }

        setLocationError(null);
      },
      () => {
        setLocationError('Włącz lokalizację, aby przypiąć wiersz do miejsca.');
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );
  };

  const startExperience = async () => {
    if (!arExperience || isStarting) return;

    setIsStarting(true);
    setCameraError(null);
    setLocationError(null);
    setOrientationError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Ta przeglądarka nie udostępnia kamery.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      const orientationCtor = window.DeviceOrientationEvent as DeviceOrientationConstructor | undefined;
      if (orientationCtor?.requestPermission) {
        const permission = await orientationCtor.requestPermission().catch(() => 'denied');
        if (permission !== 'granted') {
          setOrientationError('Bez zgody na ruch telefonu efekt będzie mniej precyzyjny.');
        }
      }

      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      startGeolocation();
      setHasStarted(true);
    } catch (error) {
      setCameraError(
        error instanceof Error ? error.message : 'Nie udało się uruchomić podglądu kamery.',
      );
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    } finally {
      setIsStarting(false);
    }
  };

  if (!arExperience) {
    return null;
  }

  const showAlignmentHint = hasStarted && !isLocked && distance !== null && distance <= activationRadius;
  const showRangeWarning = hasStarted && distance !== null && distance > activationRadius;

  return (
    <motion.div
      key="ar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] overflow-hidden bg-black text-white"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),rgba(0,0,0,0.82)_62%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.65),rgba(0,0,0,0.18)_34%,rgba(0,0,0,0.78))]" />

      <button
        onClick={onBack}
        className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 backdrop-blur-md"
      >
        <X size={18} />
      </button>

      <div className="absolute left-4 right-4 top-20 z-20 rounded-3xl border border-white/12 bg-black/30 px-5 py-4 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-ui text-[8px] text-white/55">TRYB MIEJSCA</p>
            <h2 className="mt-1 text-2xl">{arExperience.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/72">{arExperience.hint}</p>
          </div>
          {distance !== null && (
            <div className="shrink-0 text-right">
              <p className="label-ui text-[8px] text-white/45">ODLEGŁOŚĆ</p>
              <p className="mt-1 font-cormorant text-2xl">{distance} m</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 top-[26%] z-20 px-8">
        <div className="mx-auto max-w-sm rounded-[2rem] border border-white/18 bg-white/5 px-4 py-14 shadow-[0_12px_64px_rgba(0,0,0,0.28)] backdrop-blur-[2px]">
          <div className="mx-auto mb-6 h-[1px] w-20 bg-white/35" />
          <AnimatePresence mode="wait">
            {hasStarted ? (
              <motion.div
                key="verse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 text-center"
              >
                {arExperience.lines.map((line, index) => (
                  <FloatingLine
                    key={line}
                    text={line}
                    index={index}
                    isLocked={isLocked}
                    isRevealed={isRevealed}
                    parallaxX={parallaxX}
                    parallaxY={parallaxY}
                    accentColor={accentColor}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <Camera size={24} />
                </div>
                <p className="mt-5 text-sm leading-relaxed text-white/72">
                  To jest lekki tryb AR dla telefonu: kamera, lokalizacja i ruch urządzenia wywołują wers na miejscu.
                </p>
                <button
                  onClick={startExperience}
                  disabled={isStarting}
                  className="mt-6 w-full border border-white/20 bg-white px-4 py-4 text-black transition-colors disabled:opacity-60"
                >
                  <span className="label-ui">{isStarting ? 'Uruchamianie…' : 'Włącz kamerę'}</span>
                </button>
                {cameraError && (
                  <p className="mt-4 text-sm leading-relaxed text-white/72">{cameraError}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {hasStarted && (
        <div className="absolute bottom-5 left-4 right-4 z-20 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/12 bg-black/35 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white/72">
                <LocateFixed size={14} />
                <span className="label-ui text-[8px]">MIEJSCE</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                {distance === null
                  ? 'Szukam twojej pozycji…'
                  : distance <= activationRadius
                    ? `Jesteś w zasięgu punktu „${point.title}”.`
                    : `Podejdź bliżej niż ${activationRadius} m od miejsca.`}
              </p>
            </div>

            <div className="rounded-2xl border border-white/12 bg-black/35 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white/72">
                <Compass size={14} />
                <span className="label-ui text-[8px]">KADR</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                {showRangeWarning
                  ? 'Najpierw podejdź do punktu.'
                  : showAlignmentHint
                    ? `Skieruj telefon na ${arExperience.anchorLabel}.`
                    : isRevealed
                      ? 'Wers został uchwycony.'
                      : 'Porusz telefonem delikatnie, aż litery się złożą.'}
              </p>
            </div>
          </div>

          {(cameraError || locationError || orientationError) && (
            <div className="rounded-2xl border border-white/12 bg-black/45 px-4 py-3 text-sm leading-relaxed text-white/72 backdrop-blur-md">
              {cameraError || locationError || orientationError}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
