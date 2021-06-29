<template>
    <nav role="navigation">
        <ul>
            <li @click="prev" :class="{ 'hide-icon': !$parent.isEditing && currentPage === 0 }">
                <wwObject v-bind="$parent.content.paginatorPrev" v-if="$parent.content.paginatorPrev"></wwObject>
            </li>
            <template v-if="$parent.content.paginatorText">
                <li
                    v-for="(nav, index) in navigation"
                    :key="index"
                    @click="goTo(nav.index)"
                    :aria-current="nav.index === currentPage"
                >
                    <wwObject
                        v-bind="$parent.content.paginatorText"
                        :wwProps="{ text: nav.label }"
                        :states="nav.states"
                    ></wwObject>
                </li>
            </template>
            <li @click="next" :class="{ 'hide-icon': !$parent.isEditing && currentPage === nbPage - 1 }">
                <wwObject v-bind="$parent.content.paginatorNext" v-if="$parent.content.paginatorNext"></wwObject>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    computed: {
        nbPage() {
            if (this.$parent.content.maxItems) {
                return Math.ceil(this.$parent.total / this.$parent.content.maxItems);
            } else {
                return 1;
            }
        },
        currentPage() {
            if (this.$parent.content.maxItems) {
                return Math.floor(this.$parent.start / this.$parent.content.maxItems);
            } else {
                return 1;
            }
        },
        navigation() {
            const lastPage = this.nbPage - 1;
            const prev = this.currentPage - 1;
            const next = this.currentPage + 1;
            let index = 0;
            let navigation = [];
            navigation.push({ label: '1', index: 0 });

            // Prev page
            if (prev > index) {
                // Separator
                if (prev > index + 1) {
                    navigation.push({ label: '...', index: -1 });
                }
                navigation.push({ label: `${prev + 1}`, index: prev });
                index = prev;
            }

            // Current page
            if (this.currentPage !== 0 && this.currentPage !== lastPage) {
                navigation.push({ label: `${this.currentPage + 1}`, index: this.currentPage });
                index = this.currentPage;
            }

            // NextPage
            if (next < lastPage && next > index) {
                navigation.push({ label: `${next + 1}`, index: next });
                index = next;
                // Separator
                if (next < lastPage - 1) {
                    navigation.push({ label: '...', index: -1 });
                }
            }

            // Last page
            if (lastPage > index) {
                navigation.push({ label: `${lastPage + 1}`, index: lastPage });
            }

            return navigation;
        },
    },
    methods: {
        goTo(index) {
            if (index !== -1 && index !== this.currentPage) {
                this.$parent.start = index * this.$parent.content.maxItems;
            }
        },
        prev() {
            if (this.currentPage > 0) {
                this.goTo(this.currentPage - 1);
            }
        },
        next() {
            if (this.currentPage < this.nbPage - 1) {
                this.goTo(this.currentPage + 1);
            }
        },
    },
    /* wwEditor:start */
    async mounted() {
        if (this.$parent.wwEditorState.isACopy) {
            return;
        }
        if (
            !this.$parent.content.paginatorText ||
            !this.$parent.content.paginatorPrev ||
            !this.$parent.content.paginatorNext
        ) {
            const paginatorText = await wwLib.createElement('ww-text');
            const paginatorPrev = await wwLib.createElement('ww-icon', { icon: 'fas fa-angle-left' });
            const paginatorNext = await wwLib.createElement('ww-icon', { icon: 'fas fa-angle-right' });
            this.$parent.$emit('update:content:effect', {
                paginatorText,
                paginatorPrev,
                paginatorNext,
            });
        }
    },
    /* wwEditor:end */
};
</script>

<style lang="scss" scoped>
ul {
    display: flex;
    align-items: center;
    justify-content: center;
    list-style: none;
    margin: 0;
    li {
        padding: 0;
        user-select: none;
        cursor: pointer;
    }
}
.hide-icon {
    opacity: 0;
    pointer-events: none;
}
</style>
