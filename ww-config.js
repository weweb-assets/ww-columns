export default {
    editor: {
        label: { en: 'Columns', fr: 'Colonnes' },
        icon: 'two-columns',
        bubble: {
            icon: 'two-columns',
        },
    },
    properties: {
        grid: {
            hidden: true,
            responsive: true,
            defaultValue: [],
        },
        children: {
            bindable: 'repeatable',
            label: {
                en: 'Items',
                fr: 'Items',
            },
            type: 'Info',
            options: {
                text: {
                    en: 'Elements to repeat',
                },
            },
            defaultValue: [],
        },
        type: {
            label: { en: 'Display type', fr: "Type d'affichage" },
            type: 'BigIconRadioGroup',
            options: (content, sidepanelContent, boundProps) => {
                const isBound = boundProps && boundProps.children;
                return {
                    choices: [
                        ...(isBound ? [] : [{ icon: 'type-columns', value: 'columns', label: 'Columns' }]),
                        { icon: 'type-rows', value: 'rows', label: 'Rows' },
                        { icon: 'type-mosaic', value: 'mosaic', label: 'Mosaic' },
                    ],
                };
            },
            responsive: true,
            defaultValue: 'columns',
        },
        presets: {
            label: { en: 'Presets' },
            type: 'BigButtons',
            hidden: content => content.type === 'rows',
            editorOnly: true,
            options: content => ({
                action: 'setPreset',
                values:
                    content.type === 'columns'
                        ? [
                              { icon: 'two-columns', id: 'two-columns' },
                              { icon: 'two-columns-small-left', id: 'two-columns-small-left' },
                              { icon: 'two-columns-small-right', id: 'two-columns-small-right' },
                              { icon: 'three-columns', id: 'three-columns' },
                              { icon: 'three-columns-big-middle', id: 'three-columns-big-middle' },
                              { icon: 'four-columns', id: 'four-columns' },
                              { icon: 'five-columns', id: 'five-columns' },
                              { icon: 'six-columns', id: 'six-columns' },
                          ]
                        : [
                              { icon: 'two-columns-mosaic', id: 'two-columns-mosaic' },
                              { icon: 'three-columns-mosaic', id: 'three-columns-mosaic' },
                              { icon: 'four-columns-mosaic', id: 'four-columns-mosaic' },
                              { icon: 'five-columns-mosaic', id: 'five-columns-mosaic' },
                          ],
            }),
        },
        justifyContent: {
            label: { en: 'Justify' },
            type: 'TextRadioGroup',
            hidden: content => content.type !== 'mosaic',
            options: {
                choices: [
                    { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-x-start' },
                    { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-x-center' },
                    { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-x-end' },
                    {
                        value: 'space-around',
                        title: { en: 'Space around', fr: 'Space around' },
                        icon: 'align-x-space-around',
                    },
                    {
                        value: 'space-between',
                        title: { en: 'Space between', fr: 'Space between' },
                        icon: 'align-x-space-between',
                    },
                ],
            },
            responsive: true,
            defaultValue: 'center',
        },
        alignItems: {
            label: { en: 'Alignment' },
            type: 'TextRadioGroup',
            hidden: content => content.type !== 'mosaic',
            options: {
                choices: [
                    { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-y-start' },
                    { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-y-center' },
                    { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-y-end' },
                    { value: 'stretch', title: { en: 'Stretch', fr: 'Stretch' }, icon: 'align-y-stretch' },
                    { value: 'baseline', title: { en: 'Baseline', fr: 'Baseline' }, icon: 'align-y-baseline' },
                ],
            },

            responsive: true,
            defaultValue: 'stretch',
        },
        reverse: {
            label: { en: 'Reverse order', fr: "Inverser l'ordre" },
            type: 'TextRadioGroup',
            options: {
                choices: [
                    { title: 'off', value: false, default: true, label: 'Off' },
                    { title: 'on', value: true, label: 'On' },
                ],
            },
            responsive: true,
            defaultValue: false,
        },
        pushLast: {
            label: { en: 'Push last to the end', fr: 'Push last to the end' },
            type: 'OnOff',
            responsive: true,
            defaultValue: false,
        },
        lengthInUnitRadio: {
            label: { en: 'Grid system', fr: 'Grille' },
            hidden: content => content.type === 'rows',
            type: 'BigButtons',
            editorOnly: true,
            section: 'settings',
            options: {
                action: 'setGridSystem',
                values: [
                    { label: '%', id: 'percent' },
                    { label: 'U', id: 'unit' },
                ],
            },
        },
        lengthInUnit: {
            hidden: content => content.type === 'rows' || content.lengthInUnit === 100,
            label: { en: 'Units count' },
            type: 'Number',
            section: 'settings',
            responsive: true,
            defaultValue: 12,
        },
    },
};
