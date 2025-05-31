<template>
<v-row justify="end" class="pa-3">
<v-btn color="error" class="ma-2" variant="outlined" @click="confirmDelete" name="DeleteButton">Excluir Entidade1</v-btn>
<v-btn color="primary" class="ma-2" @click="editaEntidade1(form.Id)" name="EditButton">Editar Entidade1</v-btn>
</v-row>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <form @submit.prevent="onSubmit">
        <v-card elevation="10" class="" rounded="md">
            <v-card-text class="pa-sm-6 pa-3 pb-sm-6 pb-6">
                <v-row >

                    <v-col cols="12">
                        <v-label class="font-weight-medium mb-2">nome</v-label>
                        <VTextField  type="text" placeholder="nome string" hide-details v-model='form.Nome' disabled name="Nome"></VTextField>
                    </v-col>
                    <v-col cols="12">
                        <v-label class="font-weight-medium mb-2">numero</v-label>
                        <VTextField  type="number" placeholder="numero integer" hide-details v-model='form.Numero' disabled name="Numero"></VTextField>
                    </v-col>
                    <v-col cols="12">
                        <v-label class="font-weight-medium mb-2">Entidade2</v-label>
                        <v-select :items="Entidade2Options" item-title="Id" item-value="Id" placeholder="Select Entidade2" hide-details v-model="form.Entidade2Id" disabled name="Entidade2"></v-select>
                    </v-col>

                </v-row>
            </v-card-text>
        </v-card>
    </form>
    <!-- Diálogo de Confirmação de Exclusão -->
    <v-dialog v-model="dialogDelete" persistent max-width="290">
        <v-card>
            <v-card-title class="headline">Confirmar Exclusão</v-card-title>
            <v-card-text>Tem certeza de que deseja excluir esta Entidade1?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialogDelete = false">Cancelar</v-btn>
                <v-btn color="blue darken-1" text @click="deletaEntidade1" name="confirmDeleteButton">Confirmar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
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

const { list, remove, getById } = Entidade1Service();
const route = useRoute();
const params = route.params;
const router = useRouter();
const dialogDelete = ref(false);

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


const page = ref({ title: 'Detalhes Entidade1' });

onMounted(async () => {
    if (params.id) {
        await getPost(params.id);
        page.value.title = 'Detalhes Entidade1';
        breadcrumbs.value[1].text = page.value.title;
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

function editaEntidade1(id) {
    router.push({ path: `/Entidade1/formEntidade1/${id}` });
}

function confirmDelete() {
    dialogDelete.value = true;
}

const deletaEntidade1 = async () => {
    try {
        await remove(form.Id);
        Swal.fire({
        title: "Deletado com sucesso!",
        icon: "success",
        confirmButtonColor: "#D3D3D3"
      });
      router.push({ path: '/Entidade1/IndexEntidade1' });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao salvar!",
        text: "Não foi possível apagar."
      });
    } finally {
        dialogDelete.value = false;
    }
};




</script>