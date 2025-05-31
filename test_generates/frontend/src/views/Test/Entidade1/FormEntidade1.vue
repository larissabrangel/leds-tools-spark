<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <form @submit.prevent="onSubmit">
        <v-card elevation="10" class="" rounded="md">
            <v-card-text class="pa-sm-6 pa-3 pb-sm-6 pb-6">
                <v-row >

                    <v-col cols="12">
                        <v-label class="font-weight-medium mb-2">nome</v-label>
                        <VTextField  type="text" placeholder="nome string" hide-details v-model='form.Nome' name="nome"></VTextField>
                    </v-col>
                    <v-col cols="12">
                        <v-label class="font-weight-medium mb-2">numero</v-label>
                        <VTextField  type="number" placeholder="numero integer" hide-details v-model='form.Numero' name="numero"></VTextField>
                    </v-col>
                    <v-col cols="12">
                        <v-label class="font-weight-medium mb-2">Entidade2</v-label>
                        <v-select :items="Entidade2Options" item-title="Id" item-value="Id" placeholder="Select Entidade2" hide-details v-model="form.Entidade2Id" name="Entidade2"></v-select>
                    </v-col>

                    <v-col cols="12" class="d-flex justify-end">
                        <v-btn type="button" color="primary" variant="outlined" class="mr-3" @click='navigateBack' name="NavBackButton">Voltar</v-btn>
                        <v-btn type="submit" color="primary" flat name="SubmitButton">{{ submitButtonText }}</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </form>
</template>

<script async setup lang="ts">
import { ref } from 'vue';
import Swal from 'sweetalert2';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Entidade1Service from '../../../services/requires/Entidade1Requires';
import Entidade2Service from '../../../services/requires/Entidade2Requires';

import dayjs from 'dayjs';

const { list: listEntidade2 } = Entidade2Service();

const { list, post, getById, update } = Entidade1Service();
const route = useRoute();
const params = route.params;
const router = useRouter();

const Entidade2Options = ref([]);

const form = reactive({
    id: '',
    Nome: '',
    Numero: '',
    Entidade2Id: ''
});


const verificaArrayParams = () => {
    if (typeof params.id === 'string') {
        return params.id;
    } else if (Array.isArray(params.id)) {
        return params.id[0];
    }
    return '';
};

const getPost = async (id: any) => {
    try {
        let response = await getById(id);
        Object.assign(form, response.value[0]);


    } catch (error) {
        console.error(error);
    }
};

const onSubmit = async () => {
    try {
        if (params.id) {

            form.id = verificaArrayParams()

            await update(form);
        } else {

            await post(form);
        }
        Swal.fire({
            title: "Salvo com sucesso!",
            icon: "success",
            confirmButtonColor: "#D3D3D3"
        }).then(()=>{
            router.push({ path: '/Entidade1/IndexEntidade1' });
        }
        );

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Erro ao salvar!",
            confirmButtonColor: "#D3D3D3"
        });
    }
};

const page = ref({ title: 'Cadastrar Entidade1' });
const submitButtonText = ref('Cadastrar Entidade1');

onMounted(async () => {
    if (params.id) {
        await getPost(params.id);
        page.value.title = 'Editar Entidade1';
        breadcrumbs.value[1].text = page.value.title;
        submitButtonText.value = 'Editar Entidade1';
    }

    let response;

    response = await listEntidade2();
    Entidade2Options.value = response.value;

});

const breadcrumbs = ref([
    {
        text: 'Entidade1',
        disabled: false,
        href: '/Entidade1/IndexEntidade1'
    },
    {
        text: page.value.title,
        disabled: true,
        href: '#'
    }
]);

const navigateBack = () => {
    router.push({ path: '/Entidade1/IndexEntidade1' });
};




</script>