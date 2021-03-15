const ALIGN_ITEMS = {
    label: { en: 'Alignement' },
    type: 'TextRadioGroup',
    options: {
        choices: [
            { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-y-start' },
            { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-y-center' },
            { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-y-end' },
            { value: 'stretch', title: { en: 'Stretch', fr: 'Stretch' }, icon: 'align-y-stretch' },
            { value: 'baseline', title: { en: 'Baseline', fr: 'Baseline' }, icon: 'align-y-baseline' },
        ],
    },
};
const JUSTIFY_CONTENT = {
    label: { en: 'Justify' },
    type: 'TextRadioGroup',
    options: {
        choices: [
            { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-x-start' },
            { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-x-center' },
            { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-x-end' },
            { value: 'space-around', title: { en: 'Space around', fr: 'Space around' }, icon: 'align-x-space-around' },
            {
                value: 'space-between',
                title: { en: 'Space between', fr: 'Space between' },
                icon: 'align-x-space-between',
            },
        ],
    },
};

function getLengthInUnit(content) {
    if (content.type === 'rows') return {};
    return {
        lengthInUnitRadio: {
            path: 'lengthInUnit',
            label: { en: 'Grid system', fr: 'Grille' },
            type: 'TextRadioGroup',
            options: {
                choices: [
                    { title: 'Percentage', value: 100, label: '%' },
                    { title: 'Columns', value: 12, label: 'U', default: true },
                ],
            },
        },
        ...(content.lengthInUnit === 100
            ? null
            : {
                  lengthInUnit: {
                      label: { en: 'Number of units', fr: "Nb d'unité" },
                      type: 'Number',
                  },
              }),
    };
}

export function getLabel(content) {
    if (content.type === 'columns') return { en: 'Columns', fr: 'Colonnes' };
    if (content.type === 'rows') return { en: 'Rows', fr: 'Lignes' };
    return { en: 'Mosaic', fr: 'Mosaïque' };
}

export function getConfiguration(content, bindedProps) {
    const isBinded = bindedProps && bindedProps.children;
    return {
        label: getLabel(content),
        menuOptions: {
            quick: {
                label: { en: 'Edit layout' },
                sections: content.type === 'mosaic' ? ['type', 'justifyContent', 'alignItems'] : ['type'],
            },
        },
        styleOptions: {
            type: {
                label: { en: 'Display type', fr: "Type d'affichage" },
                type: 'BigIconRadioGroup',
                options: {
                    choices: [
                        ...(isBinded ? [] : [{ icon: 'type-columns', value: 'columns', label: 'Columns' }]),
                        { icon: 'type-rows', value: 'rows', label: 'Rows' },
                        { icon: 'type-mosaic', value: 'mosaic', label: 'Mosaic' },
                    ],
                },
            },
            quick: {
                label: { en: 'Presets' },
                type: 'BigButtons',
                options: {
                    actions: [
                        { icon: 'settings', value: 'edit' },
                        { icon: 'settings', value: 'edit' },
                        { icon: 'settings', value: 'edit' },
                        { icon: 'settings', value: 'edit' },
                        { icon: 'settings', value: 'edit' },
                        { icon: 'settings', value: 'edit' },
                    ],
                },
            },
            ...(content.type === 'mosaic'
                ? {
                      justifyContent: JUSTIFY_CONTENT,
                      alignItems: ALIGN_ITEMS,
                  }
                : {}),
            reverse: {
                label: { en: 'Reverse order', fr: "Inverser l'ordre" },
                type: 'TextRadioGroup',
                options: {
                    choices: [
                        { title: 'off', value: false, default: true, label: 'Off' },
                        { title: 'on', value: true, label: 'On' },
                    ],
                },
            },
            pushLast: {
                label: { en: 'Push last to the end', fr: 'Push last to the end' },
                type: 'OnOff',
            },
        },
        settingsOptions: {
            ...getLengthInUnit(content),
            maxItems: {
                label: { en: 'Number of items max', fr: 'Nombre maximal' },
                type: 'Number',
                options: {
                    nullable: true,
                    min: 1,
                    max: 100,
                },
            },
            pagination: {
                label: {
                    en: 'Use pagination ?',
                },
                type: 'TextRadioGroup',
                options: {
                    choices: [
                        { title: 'bottom', value: 'bottom', label: 'Bottom' },
                        { title: 'top', value: 'top', label: 'Top' },
                        { title: 'None', value: null, label: 'None' },
                    ],
                },
            },
        },
    };
}
