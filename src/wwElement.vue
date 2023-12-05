<template>
    <div class="ww-columns" :class="{ editing: wwEditorState?.canBeEdited, empty: isEmpty }">
        <wwLayout
            class="ww-columns__dropzone"
            path="children"
            :direction="direction"
            :style="layoutStyle"
            ww-responsive="wwLayout"
            @update:list="update"
        >
            <template #default="{ item, index }">
                <div
                    class="ww-columns__column"
                    :ww-responsive="`index-${index}`"
                    :class="[
                        {
                            /* wwEditor:start */
                            'show-length': showLength,
                            /* wwEditor:end */
                            editing: wwEditorState?.canBeEdited,
                            draging: dragingIndex === index,
                        },
                    ]"
                    :style="getItemStyle(index)"
                >
                    <wwElement
                        v-bind="item"
                        class="ww-columns__object"
                        :extra-style="wwObjectFlex"
                        :ww-responsive="`wwobject-${index}`"
                    ></wwElement>

                    <!-- wwEditor:start -->
                    <template v-if="wwEditorState?.canBeEdited && content.type !== 'rows'">
                        <wwEditorDraggable
                            v-if="content.type === 'columns' && index > 0"
                            class="ww-columns__handle start"
                            :class="{ active: isDraging }"
                            @startDrag="startDrag($event, index, 'start')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter="isHover = true"
                            @mouseleave="isHover = false"
                        />
                        <wwEditorDraggable
                            v-if="content.type === 'mosaic'"
                            class="ww-columns__handle end"
                            :class="{ active: isDraging }"
                            @startDrag="startDrag($event, index, 'end')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter="isHover = true"
                            @mouseleave="isHover = false"
                        />
                        <div class="ww-columns__units">
                            {{ `${getGridAt(index)}${content.lengthInUnit === 100 ? '%' : ''}` }}
                        </div>
                        <div class="ww-columns__border"></div>
                    </template>
                    <!-- wwEditor:end -->
                </div>
            </template>
        </wwLayout>
    </div>
</template>

<script>
export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
        wwFrontState: { type: Object, required: true },
    },
    emits: ['update:content', 'update:content:effect'],
    data() {
        return {
            dragingHandle: 'start',
            dragingIndex: -1,

            style: this.getStyle(),
            direction: this.getDirection(),
            /* wwEditor:start */
            isHover: false,
            /* wwEditor:end */
        };
    },
    computed: {
        screenSize() {
            return this.wwFrontState.screenSize;
        },
        isBound() {
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
        /* wwEditor:start */
        isDraging() {
            return this.dragingIndex >= 0;
        },
        showLength() {
            return this.isDraging || this.isHover;
        },
        /* wwEditor:end */
        wwObjectFlex() {
            const style = {};
            const isFlex = this.content.type !== 'mosaic' || this.content.alignItems === 'stretch';
            style.flexGrow = isFlex ? '1' : 'unset';
            if (this.content.type === 'columns') style.alignSelf = 'auto';
            return style;
        },
        layoutStyle() {
            return {
                flexDirection: this.direction,
                ...this.style,
            };
        },
        children() {
            if (!this.content.children || !Array.isArray(this.content.children)) {
                return [];
            }
            return this.content.children;
        },
    },
    watch: {
        /* wwFront:start */
        screenSize(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.style = this.getStyle();
                this.direction = this.getDirection();
            }
        },
        /* wwFront:end */

        /* wwEditor:start */
        'content.lengthInUnit'(newVal, oldVal) {
            if (newVal && newVal !== oldVal) this.updateGrid();
        },
        'content.type'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.updateGrid();
                this.style = this.getStyle();
                this.direction = this.getDirection();
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
            }
        },
        'content.grid'(newVal, oldVal) {
            if (this.wwEditorState.isACopy) {
                return;
            }
            if (!this.isDraging) {
                if (!_.isEqual(newVal, oldVal)) this.updateGrid();
                else this.fixGrid();
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
        isBound(isBound, wasBound) {
            if (isBound !== wasBound) {
                if (isBound) {
                    const update = {};
                    if (this.children.length) {
                        update.grid = [this.content.grid[0] || 1];
                    }
                    if (this.content.type === 'columns') {
                        update.type = 'mosaic';
                    }
                    this.$emit('update:content:effect', update);
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
    methods: {
        getItemStyle(index) {
            const style = {
                flexShrink: 'unset',
                justifyContent: '',
            };

            //Reverse
            if (this.content.reverse) {
                style.order = this.children.length - 1 - index;
            } else {
                style.order = index;
            }

            //Push last
            if (this.content.pushLast) {
                const push = !this.content.reverse ? index === this.children.length - 1 : index === 0;
                if (push) {
                    if (this.content.direction === 'column') {
                        style.marginTop = 'auto';
                    } else {
                        style.marginLeft = 'auto';
                    }
                }
            }

            if (this.content.type !== 'rows') {
                const widthInUnit = this.getGridAt(index);
                style.width = `calc(${widthInUnit} * 100% / ${this.content.lengthInUnit})`;
                style.flexShrink = '0';
            } else {
                style.width = `100%`;
            }

            if (
                this.content.type === 'mosaic' &&
                this.content.alignItems !== 'stretch' &&
                this.content.alignItems !== 'baseline'
            ) {
                style.justifyContent = this.content.alignItems;
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
            index = this.isBound ? 0 : index;
            grid = grid || this.content.grid;
            if (!grid) return 1;
            if (index >= grid.length) {
                return grid[0] || 1;
            } else {
                return grid[index];
            }
        },
        fit(list, grid) {
            if (this.isBound) return;
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
                    case 'group':
                        grid = [...this.content.grid];
                        for (const child of event.movingChildren) {
                            if (child.layoutIndex !== event.index) {
                                grid.splice(child.layoutIndex, 1);
                            }
                        }
                        if (this.content.type === 'columns') {
                            grid = this.fit(event.list, grid);
                        }
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

                this.$emit('update:content:effect', update);
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
        updateGrid() {
            if (this.wwEditorState.isACopy) {
                return;
            }
            let grid = [...this.content.grid];
            if (this.content.type === 'columns') {
                grid = this.fit(this.children, grid);
            } else {
                grid = grid.map(item => Math.min(item, this.content.lengthInUnit));
            }
            if (!_.isEqual(grid, this.content.grid)) this.$emit('update:content:effect', { grid });
        },
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
                },
                this.wwFrontState.sectionId,
                true
            );
        },
        async setPreset(preset) {
            switch (preset) {
                case 'two-columns': {
                    let children = this.children.slice(0, 2);
                    for (let i = children.length; i < 2; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [6, 6], lengthInUnit: 12 });
                    break;
                }
                case 'two-columns-small-left': {
                    let children = this.children.slice(0, 2);
                    for (let i = children.length; i < 2; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [3, 9], lengthInUnit: 12 });
                    break;
                }
                case 'two-columns-small-right': {
                    let children = this.children.slice(0, 2);
                    for (let i = children.length; i < 2; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [9, 3], lengthInUnit: 12 });
                    break;
                }
                case 'three-columns': {
                    let children = this.children.slice(0, 3);
                    for (let i = children.length; i < 3; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [4, 4, 4], lengthInUnit: 12 });
                    break;
                }
                case 'three-columns-big-middle': {
                    let children = this.children.slice(0, 3);
                    for (let i = children.length; i < 3; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [2, 8, 2], lengthInUnit: 12 });
                    break;
                }
                case 'four-columns': {
                    let children = this.children.slice(0, 4);
                    for (let i = children.length; i < 4; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [3, 3, 3, 3], lengthInUnit: 12 });
                    break;
                }
                case 'five-columns': {
                    let children = this.children.slice(0, 5);
                    for (let i = children.length; i < 5; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [4, 4, 4, 4, 4], lengthInUnit: 20 });
                    break;
                }
                case 'six-columns': {
                    let children = this.children.slice(0, 6);
                    for (let i = children.length; i < 6; i++) {
                        const container = await this.createContainer();
                        children.push(container);
                    }
                    this.$emit('update:content', { children, grid: [2, 2, 2, 2, 2, 2], lengthInUnit: 12 });
                    break;
                }
                case 'two-columns-mosaic': {
                    if (this.isBound) {
                        this.$emit('update:content', { grid: [6], lengthInUnit: 12 });
                    } else {
                        let children = [...this.children];
                        for (let i = children.length; i < 2; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 6);
                        this.$emit('update:content', { children, grid, lengthInUnit: 12 });
                    }
                    break;
                }
                case 'three-columns-mosaic': {
                    if (this.isBound) {
                        this.$emit('update:content', { grid: [4], lengthInUnit: 12 });
                    } else {
                        let children = [...this.children];
                        for (let i = children.length; i < 3; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 4);
                        this.$emit('update:content', { children, grid, lengthInUnit: 12 });
                    }
                    break;
                }
                case 'four-columns-mosaic': {
                    if (this.isBound) {
                        this.$emit('update:content', { grid: [3], lengthInUnit: 12 });
                    } else {
                        let children = [...this.children];
                        for (let i = children.length; i < 4; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 3);
                        this.$emit('update:content', { children, grid, lengthInUnit: 12 });
                    }
                    break;
                }
                case 'five-columns-mosaic': {
                    if (this.isBound) {
                        this.$emit('update:content', { grid: [4], lengthInUnit: 20 });
                    } else {
                        let children = [...this.children];
                        for (let i = children.length; i < 5; i++) {
                            const container = await this.createContainer();
                            children.push(container);
                        }
                        const grid = children.map(() => 4);
                        this.$emit('update:content', { children, grid, lengthInUnit: 20 });
                    }
                    break;
                }
            }
        },
        async setGridSystem(system) {
            this.$emit('update:content', { lengthInUnit: system === 'percent' ? 100 : 12 });
        },
        fixGrid() {
            if (this.content.type === 'rows') return;
            if (this.isBound) {
                if (this.content.grid.length !== 1) {
                    const grid = this.content.grid.length === 0 ? [this.content.lengthInUnit] : [this.content.grid[0]];
                    this.$emit('update:content:effect', { grid });
                    return;
                }
            } else {
                if (this.content.grid.length !== this.children.length) {
                    let grid = this.content.grid.slice(0, this.children.length);
                    for (let i = grid.length; i < this.children.length; i++) {
                        grid.unshift(grid[0]);
                    }
                    if (this.content.type === 'columns') {
                        grid = this.fit(this.children, grid);
                    }
                    this.$emit('update:content:effect', { grid });
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
                    [this.isBound ? 0 : this.dragingIndex]: newGridValue,
                });
            }
        },
        setGridValue(update) {
            const grid = this.content.grid.map((val, i) => update[i] || val);
            if (!_.isEqual(grid, this.content.grid)) {
                this.$emit('update:content', { grid });
            }
        },
        /* wwEditor:end */
    },
};
</script>

<style lang="scss" scoped>
.ww-columns {
    position: relative;
    box-sizing: border-box;

    &__dropzone {
        display: flex;
        height: 100%;
        width: 100%;
    }

    &__column {
        position: relative;
        display: flex;
        flex-direction: column;

        /* wwEditor:start */
        .ww-columns__handle {
            // display: none;
            opacity: 0;
            pointer-events: none;
        }
        &.editing:hover,
        &.editing.draging,
        &.editing.show-length {
            > .ww-columns__handle {
                // display: flex;
                opacity: 1;
                pointer-events: initial;
            }
            & > .ww-columns__border {
                opacity: 1;
            }
        }
        &.editing.show-length {
            > .ww-columns__units {
                // display: flex;
                opacity: 1;
                pointer-events: initial;
            }
        }
        /* wwEditor:end */
    }

    /* wwEditor:start */
    &__border {
        opacity: 0;
        border: 1px dashed var(--ww-color-blue-500);
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 10;
    }
    &__handle {
        display: flex;
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

        // &:hover,
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
        opacity: 0;
        pointer-events: none;
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
                opacity: 1;
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
