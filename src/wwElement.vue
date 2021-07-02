<template>
    <div class="ww-columns" :class="{ editing: isEditing, empty: isEmpty }">
        <Paginator v-if="content.pagination === 'top'" class="paginator"></Paginator>
        <wwLayout
            class="ww-columns__dropzone"
            path="children"
            :direction="direction"
            :style="layoutStyle"
            :start="start"
            :pagination="!!content.pagination"
            :max="content.maxItems"
            :inheritFromElement="inheritFromElement"
            @update:total="total = $event"
            @update="update"
            ww-responsive="wwLayout"
        >
            <template v-slot="{ item, index }">
                <wwLayoutItem
                    class="ww-columns__item"
                    :class="[
                        {
                            editing: isEditing,
                            draging: dragingIndex === index,
                            'show-length': showLength,
                        },
                    ]"
                    :style="getItemStyle(item, index)"
                    :ww-responsive="`index-${index}`"
                >
                    <wwObject
                        v-bind="item"
                        class="ww-columns__object"
                        :style="{ flex: wwObjectFlex }"
                        :ww-responsive="`wwobject-${index}`"
                    ></wwObject>
                    <!-- wwEditor:start -->
                    <template v-if="isEditing && content.type !== 'rows'">
                        <wwDraggable
                            v-if="content.type === 'columns' && index > 0"
                            class="ww-columns__handle start"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'start')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter.native="isHover = true"
                            @mouseleave.native="isHover = false"
                        />
                        <wwDraggable
                            v-if="content.type === 'mosaic'"
                            class="ww-columns__handle end"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'end')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter.native="isHover = true"
                            @mouseleave.native="isHover = false"
                        />
                        <div v-if="showLength" class="ww-columns__units">
                            {{ `${getGridAt(index)}${content.lengthInUnit === 100 ? '%' : ''}` }}
                        </div>
                        <div class="ww-columns__border" :class="{ '-binded': isBinded }"></div>
                    </template>
                    <!-- wwEditor:end -->
                </wwLayoutItem>
            </template>
        </wwLayout>
        <Paginator v-if="content.pagination === 'bottom'" class="paginator"></Paginator>
        <!-- wwEditor:start -->
        <template v-if="isEditing">
            <div class="ww-columns__menu">
                <wwEditorIcon
                    small
                    name="two-columns"
                    @mouseenter="isHover = true"
                    @mouseleave="isHover = false"
                ></wwEditorIcon>
            </div>
            <div class="ww-columns__border" :class="{ '-binded': isBinded }"></div>
        </template>

        <!-- wwEditor:end -->
    </div>
</template>

<script>
import Paginator from './Paginator.vue';
import { getConfiguration } from './config.js';

export default {
    name: '__COMPONENT_NAME__',
    components: { Paginator },
    wwDefaultContent: {
        children: [],

        type: wwLib.responsive('columns'),
        lengthInUnit: wwLib.responsive(12),

        reverse: wwLib.responsive(false),
        pushLast: wwLib.responsive(false),
        justifyContent: wwLib.responsive('center'),
        alignItems: wwLib.responsive('stretch'),
        grid: wwLib.responsive([]),

        maxItems: wwLib.responsive(50),
        pagination: wwLib.responsive(null),

        /* wwEditor:start */
        isHover: false,
        /* wwEditor:end */
    },
    wwEditorConfiguration({ content, bindedProps }) {
        return getConfiguration(content, bindedProps);
    },
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: Object,
        /* wwEditor:end */
    },
    data() {
        return {
            dragingHandle: 'start',
            dragingIndex: -1,

            start: 0,
            total: 0,

            style: this.getStyle(),
            wwObjectFlex: this.getWwObjectFlex(),
            direction: this.getDirection(),
            inheritFromElement: this.getInheritFromElement(),
        };
    },
    computed: {
        screenSize() {
            return this.$store.getters['front/getScreenSize'];
        },
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        isBinded() {
            /* wwEditor:start */
            return this.wwEditorState.boundProps && this.wwEditorState.boundProps.children;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        isEmpty() {
            /* wwEditor:start */
            return !this.content || !this.content.children || !this.content.children.length;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        isDraging() {
            return this.dragingIndex >= 0;
        },
        showLength() {
            return this.isDraging || this.isHover;
        },
        layoutStyle() {
            return {
                flexDirection: this.direction,
                ...this.style,
            };
        },
    },
    methods: {
        getItemStyle(item, index) {
            const style = {
                '--display': 'block',
                marginTop: 'unset',
                marginLeft: 'unset',
                flexShrink: 'unset',
                justifyContent: '',
                width: 'unset',
            };

            //Reverse
            if (this.content.reverse) {
                style.order = this.content.children.length - 1 - index;
            } else {
                style.order = index;
            }

            //Push last
            if (this.content.pushLast) {
                const push = !this.content.reverse ? index === this.content.children.length - 1 : index === 0;
                if (push) {
                    if (this.content.direction === 'column') {
                        style.marginTop = 'auto';
                    } else {
                        style.marginLeft = 'auto';
                    }
                }
            }

            if (this.content.type !== 'rows') {
                style['--display'] = 'flex';
                style.flexDirection = 'column';
                if (
                    this.content.alignItems !== 'stretch' &&
                    this.content.alignItems !== 'baseline' &&
                    this.content.type === 'mosaic'
                ) {
                    style.justifyContent = this.content.alignItems;
                }

                const widthInUnit = this.getGridAt(index);
                style.width = `calc(${widthInUnit} * 100% / ${this.content.lengthInUnit})`;
                style.flexShrink = '0';
            }

            return style;
        },
        getStyle() {
            return {
                flexWrap: this.content.type === 'mosaic' ? 'wrap' : 'unset',
                justifyContent: this.content.type === 'mosaic' ? this.content.justifyContent : 'unset',
                alignItems: this.content.type === 'mosaic' ? this.content.alignItems : 'unset',
            };
        },
        getDirection() {
            return this.content.type === 'rows' ? 'column' : 'row';
        },
        getInheritFromElement() {
            return this.content.type === 'mosaic' ? ['width', 'display'] : [];
        },
        getWwObjectFlex() {
            const isFlex = this.content.type !== 'mosaic' || this.content.alignItems === 'stretch';
            return isFlex ? '1' : 'unset';
        },
        getGridAt(index, grid) {
            index = this.isBinded ? 0 : index;
            grid = grid || this.content.grid;
            if (!grid) return 1;
            if (index >= grid.length) {
                return grid[0] || 1;
            } else {
                return grid[index];
            }
        },
        fit(list, grid) {
            if (this.isBinded) return;
            if (this.content.type !== 'columns') return;
            const totalGrid = list.reduce((total, item, i) => total + this.getGridAt(i) || 0, 0);
            const lengthInUnit = this.content.lengthInUnit;
            if (totalGrid === lengthInUnit && list.length === grid.length) return grid;

            const count = Math.max(1, list.length);
            const itemLength = Math.floor(lengthInUnit / count);
            const firstItemLength = lengthInUnit - (count - 1) * itemLength;

            return list.map((_, index) => {
                return index === 0 ? firstItemLength : itemLength;
            });
        },
        async update(event) {
            /* wwEditor:start */
            if (this.wwEditorState.isACopy) {
                return;
            }
            if (this.content.type === 'rows') {
                return;
            } else {
                let grid = [];

                switch (event.type) {
                    case 'add': {
                        const index = Math.max(0, event.index - 1);
                        grid = [...this.content.grid];
                        grid.splice(event.index, 0, this.content.grid[index] || this.content.lengthInUnit);
                        if (this.content.type === 'columns') {
                            grid = this.fit(event.list, grid);
                        }
                        break;
                    }
                    case 'remove':
                        grid = [...this.content.grid];
                        grid.splice(event.index, 1);
                        if (this.content.type === 'columns') {
                            grid = this.fit(event.list, grid);
                        }
                        break;
                    case 'move':
                        grid = this.moveItem(this.content.grid, event.fromIndex, event.index);
                        break;
                    default:
                        return;
                }
                grid = grid.map(item => Math.min(item, this.content.lengthInUnit));

                let update = { grid };
                if (event.type === 'add') {
                    const componentBaseId = this.$store.getters['websiteData/getWwObjectBaseId'](event.value.uid);

                    //ww-flexbox or ww-columns
                    if (
                        componentBaseId !== 'b783dc65-d528-4f74-8c14-e27c934c39b1' &&
                        componentBaseId !== '21881619-a984-4847-81a9-922c3dbb5853'
                    ) {
                        const container = await this.createContainer([event.value]);
                        const children = [...event.list];
                        children.splice(event.index, 1, container);
                        update.children = children;
                    }
                }

                this.$emit('update-effect', update);
            }
            /* wwEditor:end */
        },
        moveItem(grid, fromIndex, toIndex) {
            const list = [...grid];
            const [item] = list.splice(fromIndex, 1);
            if (fromIndex < toIndex) toIndex--;
            list.splice(toIndex, 0, item);
            return list;
        },
        /* wwEditor:start */
        async createContainer(children = []) {
            return await wwLib.createElement(
                'ww-flexbox',
                {
                    default: {
                        children,
                        direction: this.direction === 'row' ? 'column' : 'row',
                        alignItems: 'stretch',
                    },
                },
                {
                    style: {
                        default: {
                            padding: '8px',
                        },
                    },
                }
            );
        },
        async setPreset(preset) {
            switch (preset) {
                case 'two-columns': {
                    let children = this.content.children.slice(0, 2);
                    for (let i = children.length; i < 2; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [6, 6], lengthInUnit: 12 });
                    break;
                }
                case 'two-columns-small-left': {
                    let children = this.content.children.slice(0, 2);
                    for (let i = children.length; i < 2; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [3, 9], lengthInUnit: 12 });
                    break;
                }
                case 'two-columns-small-right': {
                    let children = this.content.children.slice(0, 2);
                    for (let i = children.length; i < 2; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [9, 3], lengthInUnit: 12 });
                    break;
                }
                case 'three-columns': {
                    let children = this.content.children.slice(0, 3);
                    for (let i = children.length; i < 3; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [4, 4, 4], lengthInUnit: 12 });
                    break;
                }
                case 'three-columns-big-middle': {
                    let children = this.content.children.slice(0, 3);
                    for (let i = children.length; i < 3; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [2, 8, 2], lengthInUnit: 12 });
                    break;
                }
                case 'four-columns': {
                    let children = this.content.children.slice(0, 4);
                    for (let i = children.length; i < 4; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [3, 3, 3, 3], lengthInUnit: 12 });
                    break;
                }
                case 'five-columns': {
                    let children = this.content.children.slice(0, 5);
                    for (let i = children.length; i < 5; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [4, 4, 4, 4, 4], lengthInUnit: 20 });
                    break;
                }
                case 'six-columns': {
                    let children = this.content.children.slice(0, 6);
                    for (let i = children.length; i < 6; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update', { children, grid: [2, 2, 2, 2, 2, 2], lengthInUnit: 12 });
                    break;
                }
                case 'two-columns-mosaic': {
                    if (this.isBinded) {
                        this.$emit('update', { grid: [6], lengthInUnit: 12 });
                    } else {
                        let children = [...this.content.children];
                        for (let i = children.length; i < 2; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 6);
                        this.$emit('update', { children, grid, lengthInUnit: 12 });
                    }
                    break;
                }
                case 'three-columns-mosaic': {
                    if (this.isBinded) {
                        this.$emit('update', { grid: [4], lengthInUnit: 12 });
                    } else {
                        let children = [...this.content.children];
                        for (let i = children.length; i < 3; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 4);
                        this.$emit('update', { children, grid, lengthInUnit: 12 });
                    }
                    break;
                }
                case 'four-columns-mosaic': {
                    if (this.isBinded) {
                        this.$emit('update', { grid: [3], lengthInUnit: 12 });
                    } else {
                        let children = [...this.content.children];
                        for (let i = children.length; i < 4; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 3);
                        this.$emit('update', { children, grid, lengthInUnit: 12 });
                    }
                    break;
                }
                case 'five-columns-mosaic': {
                    if (this.isBinded) {
                        this.$emit('update', { grid: [4], lengthInUnit: 20 });
                    } else {
                        let children = [...this.content.children];
                        for (let i = children.length; i < 5; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 4);
                        this.$emit('update', { children, grid, lengthInUnit: 20 });
                    }
                    break;
                }
            }
        },
        fixGrid() {
            if (this.content.type === 'rows') return;
            if (this.isBinded) {
                if (this.content.grid.length !== 1) {
                    const grid = this.content.grid.length === 0 ? [this.content.lengthInUnit] : [this.content.grid[0]];
                    this.$emit('update-effect', { grid });
                    return;
                }
            } else {
                if (this.content.grid.length !== this.content.children.length) {
                    let grid = this.content.grid.slice(0, this.content.children.length);
                    for (let i = grid.length; i < this.content.children.length; i++) {
                        grid.unshift(grid[0]);
                    }
                    if (this.content.type === 'columns') {
                        grid = this.fit(this.content.children, grid);
                    }
                    this.$emit('update-effect', { grid });
                    return;
                }
            }
        },
        startDrag(event, index, handle) {
            this.dragingIndex = index;
            this.dragingHandle = handle;
            const { width } = this.$el.getBoundingClientRect();
            this.unitLengthInPx = width / this.content.lengthInUnit;
            this.initialGrid = [...this.content.grid];
        },
        endDrag() {
            this.dragingIndex = -1;
        },
        drag({ totalDeltaX }) {
            if (!this.isDraging) return;
            if (this.dragingHandle === 'start') {
                totalDeltaX = -1 * totalDeltaX;
            }
            let newGridValue = Math.max(
                1,
                this.getGridAt(this.dragingIndex, this.initialGrid) + Math.round(totalDeltaX / this.unitLengthInPx)
            );
            if (this.content.type === 'columns') {
                const fromIndex = this.dragingHandle === 'start' ? this.dragingIndex - 1 : this.dragingIndex + 1;
                const sum =
                    this.getGridAt(fromIndex, this.initialGrid) + this.getGridAt(this.dragingIndex, this.initialGrid);
                newGridValue = Math.min(newGridValue, sum - 1);
                this.setGridValue({
                    [this.dragingIndex]: newGridValue,
                    [fromIndex]: sum - newGridValue,
                });
            } else {
                newGridValue = Math.min(newGridValue, this.content.lengthInUnit);
                this.setGridValue({
                    [this.isBinded ? 0 : this.dragingIndex]: newGridValue,
                });
            }
        },
        setGridValue(update) {
            const grid = this.content.grid.map((val, i) => update[i] || val);
            if (!_.isEqual(grid, this.content.grid)) {
                this.$emit('update', { grid });
            }
        },
        /* wwEditor:end */
    },
    watch: {
        /* wwFront:start */
        screenSize(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.style = this.getStyle();
                this.wwObjectFlex = this.getWwObjectFlex();
                this.direction = this.getDirection();
                this.inheritFromElement = this.getInheritFromElement();
            }
        },
        /* wwFront:end */
        total(val, oldVal) {
            if (val !== oldVal) {
                this.start = 0;
            }
        },

        /* wwEditor:start */
        content(newContent, oldContent) {
            if (this.wwEditorState.isACopy) {
                return;
            }
            if (
                (newContent.lengthInUnit && newContent.lengthInUnit !== oldContent.lengthInUnit) ||
                newContent.type !== oldContent.type ||
                (!_.isEqual(newContent.grid, oldContent.grid) && !this.isDraging)
            ) {
                let grid = [...newContent.grid];
                if (this.content.type === 'columns') {
                    grid = this.fit(newContent.children, grid);
                } else {
                    grid = grid.map(item => Math.min(item, newContent.lengthInUnit));
                }
                if (!_.isEqual(grid, newContent.grid)) this.$emit('update-effect', { grid });
            }
        },
        'content.pagination'(isPaginated, wasPaginated) {
            if (isPaginated !== wasPaginated) {
                this.start = 0;
            }
            if (this.wwEditorState.isACopy) {
                return;
            }

            clearTimeout(this.isPaginatedTimeout);
            this.isPaginatedTimeout = setTimeout(() => {
                if (!isPaginated) {
                    this.$emit('update-effect', { paginatorText: null, paginatorPrev: null, paginatorNext: null });
                }

                if (isPaginated && !wasPaginated && !this.content.maxItems) {
                    this.$emit('update-effect', { maxItems: 20 });
                }
            }, 500);
        },
        'content.maxItems'(newVal, oldVal) {
            if (this.wwEditorState.isACopy) {
                return;
            }
            if (!newVal && oldVal && this.content.pagination) {
                this.$emit('update-effect', { pagination: null });
            }
        },
        'content.type'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.style = this.getStyle();
                this.wwObjectFlex = this.getWwObjectFlex();
                this.direction = this.getDirection();
                this.inheritFromElement = this.getInheritFromElement();
            }
        },
        'content.justifyContent'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.style = this.getStyle();
            }
        },
        'content.alignItems'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.style = this.getStyle();
                this.wwObjectFlex = this.getWwObjectFlex();
            }
        },
        'content.grid'() {
            if (this.wwEditorState.isACopy) {
                return;
            }
            if (!this.isDraging) {
                this.fixGrid();
            }
        },
        isDraging(isDraging) {
            // By preventing event on the iframe, we ensure that all event will be on Manager, and not capture by the iframe
            // Previous solution was double listners (both iframe and manager), but i think this is cleaner
            const iframe = wwLib.getManagerWindow().document.querySelector('.ww-manager-iframe');
            if (isDraging) {
                iframe.classList.add('ww-stop-event');
            } else {
                iframe.classList.remove('ww-stop-event');
            }
        },
        isBinded(isBinded, wasBinded) {
            if (isBinded !== wasBinded) {
                if (isBinded) {
                    const update = {};
                    if (this.content.children.length) {
                        update.grid = [this.content.grid[0] || 1];
                        update.children = [this.content.children[0]];
                    }
                    if (this.content.type === 'columns') {
                        update.type = 'mosaic';
                    }
                    this.$emit('update-effect', update);
                }
            }
        },
        /* wwEditor:end */
    },
    mounted() {
        /* wwEditor:start */
        this.fixGrid();
        /* wwEditor:end */
    },
};
</script>

<style lang="scss" scoped>
.ww-columns {
    position: relative;
    box-sizing: border-box;
    .paginator {
        margin: 0 auto;
    }
    &__dropzone {
        display: flex;
        height: 100%;
        width: 100%;
    }
    &__item {
        display: var(--display);
        position: relative;
        box-sizing: border-box;

        /* wwEditor:start */
        .ww-columns__handle {
            display: none;
        }
        &.editing:hover,
        &.editing.draging,
        &.editing.show-length {
            > .ww-columns__handle {
                display: flex;
            }
            & > .ww-columns__border {
                border: 1px dashed var(--ww-color-blue-500);
                &.-binded {
                    border-color: var(--ww-color-purple-500);
                }
                display: block;
            }
        }
        /* wwEditor:end */
    }

    /* wwEditor:start */
    &:hover {
        > .ww-columns__menu {
            opacity: 1;
            pointer-events: all;
        }
    }
    &__border {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: none;
        pointer-events: none;
        z-index: 10;
    }
    &__menu {
        pointer-events: auto;
        opacity: 0;
        pointer-events: none;
        display: flex;
        position: absolute;
        border-radius: 100%;
        padding: var(--ww-spacing-01);
        transition: opacity 0.2s ease;
        z-index: 11;
        cursor: pointer;
        background-color: var(--ww-color-blue-500);
        color: white;
        justify-content: center;
        align-items: center;
        left: 0;
        top: 0;
        transform: translate(-50%, -50%);
        transition: transform 0.3s ease;
        &:hover {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 1;
        }
    }

    &__handle {
        position: absolute;
        background: white;
        height: 32px;
        max-height: calc(100% - 6px);
        top: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        border: 1px solid var(--ww-color-green-500);
        box-shadow: 0px 0px 3px #b8bbc0;
        border-radius: 4px;
        z-index: 12;
        cursor: ew-resize;
        transition: transform 0.2s ease;

        &:hover,
        &.active {
            transform: translate(-50%, -50%) scale(1.2);
        }
        &.start {
            left: 0;
        }
        &.end {
            left: 100%;
        }
    }
    &__units {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--ww-color-blue-500);
        color: white;
        font-size: 1.8rem;
        padding: var(--ww-spacing-02);
        z-index: 11;
    }

    &.editing {
        &:hover {
            & > .ww-columns__border {
                border: 1px solid var(--ww-color-blue-500);
                &.-binded {
                    border-color: var(--ww-color-purple-500);
                }
                display: block;
            }
            > .ww-columns__menu {
                opacity: 1;
                pointer-events: all;
            }
        }

        &.empty {
            & > .ww-columns__border {
                display: block;
            }
        }
    }
    /* wwEditor:end */
}
</style>
