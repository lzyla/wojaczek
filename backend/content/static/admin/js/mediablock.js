/**
 * MediaBlock admin — show/hide fields based on selected block type.
 * Works for both standalone MediaBlockAdmin and MediaBlockInline.
 */
(function () {
    'use strict';

    var FIELDS_BY_TYPE = {
        text:        ['text_content'],
        photo:       ['photo_url', 'photo_caption'],
        audio:       ['audio_url', 'audio_title'],
        video:       ['video_url', 'video_platform'],
        poem:        ['poem_title', 'poem_content', 'poem_background'],
        map:         ['map_lat', 'map_lng', 'map_zoom'],
        gallery:     ['gallery_json'],
        beforeAfter: ['ba_before_url', 'ba_before_label', 'ba_after_url', 'ba_after_label'],
        timeline:    ['timeline_json'],
    };

    // Collect all extra field names
    var ALL_FIELDS = [];
    Object.keys(FIELDS_BY_TYPE).forEach(function (t) {
        FIELDS_BY_TYPE[t].forEach(function (f) {
            if (ALL_FIELDS.indexOf(f) === -1) ALL_FIELDS.push(f);
        });
    });

    /**
     * Given a type <select>, find the closest form row container
     * (works for both inline and standalone admin).
     */
    function getFormContainer(selectEl) {
        // Inline: .inline-related   Standalone: #content-main form
        return selectEl.closest('.inline-related') ||
               selectEl.closest('form') ||
               document;
    }

    /**
     * For a field name like "photo_url", find its .form-row wrapper
     * inside the given container.
     */
    function findFieldRow(container, fieldName) {
        // Django wraps each field in a div.form-row with class "field-<name>"
        var row = container.querySelector('.form-row.field-' + fieldName);
        if (row) return row;

        // Fallback: look for the input/textarea by name fragment
        var input = container.querySelector('[name$="-' + fieldName + '"], [name="' + fieldName + '"]');
        if (input) {
            var r = input.closest('.form-row');
            return r;
        }
        return null;
    }

    /**
     * Toggle field visibility for a single type dropdown.
     */
    function toggleFields(selectEl) {
        var container = getFormContainer(selectEl);
        var selectedType = selectEl.value;
        var visibleFields = FIELDS_BY_TYPE[selectedType] || [];

        ALL_FIELDS.forEach(function (fieldName) {
            var row = findFieldRow(container, fieldName);
            if (!row) return;

            if (visibleFields.indexOf(fieldName) !== -1) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Also hide the raw JSON content field (it's a HiddenInput, but just in case)
        var contentRow = findFieldRow(container, 'content');
        if (contentRow) {
            contentRow.style.display = 'none';
        }
    }

    /**
     * Attach change listener to a type select and run initial toggle.
     */
    function initSelect(selectEl) {
        if (selectEl.dataset.mbInit) return; // already handled
        selectEl.dataset.mbInit = '1';

        selectEl.addEventListener('change', function () {
            toggleFields(selectEl);
        });

        // Run once now
        toggleFields(selectEl);
    }

    /**
     * Find and init all type selects on the page.
     */
    function initAll() {
        // Inline selects: id like "id_media_blocks-0-type"
        // Standalone select: id "id_type"
        var selects = document.querySelectorAll('select[name$="-type"], select[name="type"]');
        selects.forEach(function (sel) {
            // Only target our MediaBlock type selects (they have choices like text, photo, etc.)
            var options = Array.from(sel.options).map(function (o) { return o.value; });
            if (options.indexOf('text') !== -1 && options.indexOf('photo') !== -1) {
                initSelect(sel);
            }
        });
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // Handle dynamically added inlines (Django's "Add another" button)
    // Django triggers an event on the inline group when a new row is added.
    document.addEventListener('formset:added', function (event) {
        // event.detail.formsetName might be available
        var row = event.target;
        if (row) {
            var sel = row.querySelector('select[name$="-type"]');
            if (sel) initSelect(sel);
        }
    });
})();
