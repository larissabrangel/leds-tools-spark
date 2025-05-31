<script async setup >

const props = defineProps({
    title: String,
    breadcrumbs: Array ,
    icon: String,
    text: String
});


</script>

<template>
    <div class="mt-3 mb-6">
        <div class="d-flex justify-space-between">
            <div class="d-flex py-0 align-center">
                <div>
                    <h3 class="text-h3 mb-2">{{ title }}</h3>
                    <v-breadcrumbs :items="breadcrumbs" class=" pa-0 ml-n1">
                        <template v-slot:divider v-if="breadcrumbs">
                            <v-icon>mdi-chevron-right</v-icon>
                        </template>
                        <template v-slot:title="{ item }">
                            <h6 class="text-h6 font-weight-regular">{{ item.text }}</h6>
                        </template>
                    </v-breadcrumbs>
                </div>
            </div>
        </div>
    </div>
</template>

<style async lang="scss">
.page-breadcrumb {
    .v-toolbar {
        background: transparent;
    }
}
</style>