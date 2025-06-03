import path from "path";
import { checkFileContent, checkIsDir, checkIsFile } from "../../../../checkers";


export class Entidade2Checker{
    constructor(private localPath: string) { checkIsDir(this.localPath); }

    public entidade2Checkers() {
        checkIsFile(path.join(this.localPath, 'DetailsEntidade2.vue'));
        checkFileContent(path.join(this.localPath, 'DetailsEntidade2.vue'), 
        `<template>
<v-row justify="end" class="pa-3">
<v-btn color="error" class="ma-2" variant="outlined" @click="confirmDelete" name="DeleteButton">Excluir Entidade2</v-btn>
<v-btn color="primary" class="ma-2" @click="editaEntidade2(form.Id)" name="EditButton">Editar Entidade2</v-btn>
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
                        <v-label class="font-weight-medium mb-2">verificacao</v-label>
                        <VTextField  type="checkbox" placeholder="verificacao boolean" hide-details v-model='form.Verificacao' disabled name="Verificacao"></VTextField>
                    </v-col>

                </v-row>
            </v-card-text>
        </v-card>
    </form>
    <!-- Diálogo de Confirmação de Exclusão -->
    <v-dialog v-model="dialogDelete" persistent max-width="290">
        <v-card>
            <v-card-title class="headline">Confirmar Exclusão</v-card-title>
            <v-card-text>Tem certeza de que deseja excluir esta Entidade2?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialogDelete = false">Cancelar</v-btn>
                <v-btn color="blue darken-1" text @click="deletaEntidade2" name="confirmDeleteButton">Confirmar</v-btn>
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
import Entidade2Service from '../../../services/requires/Entidade2Requires';

import dayjs from 'dayjs';


const { list, remove, getById } = Entidade2Service();
const route = useRoute();
const params = route.params;
const router = useRouter();
const dialogDelete = ref(false);


const form = reactive({
    id: '',
    Nome: '',
    Verificacao: ''
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


const page = ref({ title: 'Detalhes Entidade2' });

onMounted(async () => {
    if (params.id) {
        await getPost(params.id);
        page.value.title = 'Detalhes Entidade2';
        breadcrumbs.value[1].text = page.value.title;
    }



});

const breadcrumbs = ref([
    {
        text: 'Entidade2',
        disabled: false,
        href: '/Entidade2/IndexEntidade2'
    },
    {
        text: page.value.title,
        disabled: true,
        href: '#'
    }
]);

const navigateBack = () => {
    router.push({ path: '/Entidade2/IndexEntidade2' });
};

function editaEntidade2(id) {
    router.push({ path: \`/Entidade2/formEntidade2/\${id}\` });
}

function confirmDelete() {
    dialogDelete.value = true;
}

const deletaEntidade2 = async () => {
    try {
        await remove(form.Id);
        Swal.fire({
        title: "Deletado com sucesso!",
        icon: "success",
        confirmButtonColor: "#D3D3D3"
      });
      router.push({ path: '/Entidade2/IndexEntidade2' });
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




</script>`
        );
        checkIsFile(path.join(this.localPath, 'FormEntidade2.vue'));
        checkFileContent(path.join(this.localPath, 'FormEntidade2.vue'), 
        `<template>
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
                        <v-label class="font-weight-medium mb-2">verificacao</v-label>
                        <VTextField  type="checkbox" placeholder="verificacao boolean" hide-details v-model='form.Verificacao' name="verificacao"></VTextField>
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
import Entidade2Service from '../../../services/requires/Entidade2Requires';

import dayjs from 'dayjs';


const { list, post, getById, update } = Entidade2Service();
const route = useRoute();
const params = route.params;
const router = useRouter();


const form = reactive({
    id: '',
    Nome: '',
    Verificacao: ''
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
            router.push({ path: '/Entidade2/IndexEntidade2' });
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

const page = ref({ title: 'Cadastrar Entidade2' });
const submitButtonText = ref('Cadastrar Entidade2');

onMounted(async () => {
    if (params.id) {
        await getPost(params.id);
        page.value.title = 'Editar Entidade2';
        breadcrumbs.value[1].text = page.value.title;
        submitButtonText.value = 'Editar Entidade2';
    }



});

const breadcrumbs = ref([
    {
        text: 'Entidade2',
        disabled: false,
        href: '/Entidade2/IndexEntidade2'
    },
    {
        text: page.value.title,
        disabled: true,
        href: '#'
    }
]);

const navigateBack = () => {
    router.push({ path: '/Entidade2/IndexEntidade2' });
};




</script>`
        );
        checkIsFile(path.join(this.localPath, 'IndexEntidade2.vue'));
        checkFileContent(path.join(this.localPath, 'IndexEntidade2.vue'), 
        `<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="search"
          label="Buscar Entidade2"
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="d-flex align-start">
        <v-btn class="custom-width" color="primary" variant="flat" dark @click="searchEntidade2" name="SearchButton">Buscar</v-btn>
      </v-col>
      <v-col cols="2" class="d-flex justify-end">
        <v-btn class="custom-width-2" color="primary" variant="flat" dark @click="addEntidade2" name="CreateButton">Cadastrar Entidade2</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table class="border rounded-md" :headers="headers" :items="filteredEntidade2">
          <template v-slot:top>
            <v-row>
              <v-col class="d-flex justify-end">
              </v-col>
            </v-row>
            <v-spacer />
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="text-h5 text-center py-6">Tem certeza que deseja deletar esse item?</v-card-title>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="primary" variant="outlined" dark @click="closeDelete">Cancelar</v-btn>
                  <v-btn color="primary" variant="flat" dark @click="deleteItem">OK</v-btn>
                  <v-spacer />
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
          <template v-slot:item.actions="{ item }">
          <v-icon class="mdi mdi-eye me-2" color="primary" size="small" @click="goToDetail(item.Id)" name="detailsList"/>
            <v-icon color="primary" size="small" class="me-2" @click="editItem(item.Id)">
              mdi-pencil
            </v-icon>
            <v-icon color="error" size="small" @click="confirmDeleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:no-data>
            <v-label>Sem dados!</v-label>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </template>


<script async setup lang="ts">
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Entidade2Requires from '../../../services/requires/Entidade2Requires';

const { list, remove, update, post } = Entidade2Requires();
const page = ref({ title: 'Entidade2 ' });
const breadcrumbs = ref([
  { text: 'Entidade2', disabled: true, href: '#' },
  { text: '', disabled: true, href: '#' }
]);

const dialog = ref(false);
const router = useRouter();
const dialogDelete = ref(false);
const headers = ref([

  { title: 'nome', sortable: false, key: 'Nome' },
  { title: 'verificacao', sortable: false, key: 'Verificacao' },

  { title: 'Ações', key: 'actions' }
]);
const Entidade2 = ref([]);
const filteredEntidade2 = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({});
const defaultItem = ref({});
const itemToDelete = ref<itemToDeleteInterface>();
const search = ref('');

interface Entidade2Interface {

Nome: string;
Verificacao: string;
}

interface itemToDeleteInterface {
  Id: string;
}

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Item' : 'Edit Item';
});

onMounted(() => {
  getPosts();
});

const getPosts = async () => {
  try {
    const data = await list();
    data.value.forEach((element: any) => {
      element.Data = dayjs(element.Data).format('DD/MM/YYYY');
    });
    Entidade2.value = data.value;
    filteredEntidade2.value = data.value;
  } catch (error) {
    console.error('Error fetching:', error);
  }
};

const deleteItem = async () => {
  if (itemToDelete.value) {
    try {
      await remove(itemToDelete.value.Id);
      Swal.fire({
        title: "Deletado com sucesso!",
        icon: "success",
        confirmButtonColor: "#D3D3D3"
      });
      await getPosts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao salvar!",
        text: "Não foi possível apagar."
      });
    } finally {
      closeDelete();
    }
  }
};

function confirmDeleteItem(item) {
  itemToDelete.value = item;
  dialogDelete.value = true;
}

function addEntidade2() {
  router.push('/Entidade2/formEntidade2');
}

function editItem(id: any) {
  router.push({ path: \`/Entidade2/formEntidade2/\${id}\` });
}

function goToDetail(id: any) {
  router.push({ path: \`/Entidade2/detailsEntidade2/\${id}\` });
}

function closeDelete() {
  dialogDelete.value = false;
  itemToDelete.value = null;
}

function close() {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  });
}

const searchEntidade2 = () => {
  filterEntidade2();
};

const filterEntidade2 = () => {
  if (!search.value) {
    filteredEntidade2.value = Entidade2.value;
  } else {
    const searchQuery = search.value.toLowerCase();
    filteredEntidade2.value = Entidade2.value.filter(item =>
      item.Nome.toLowerCase().includes(searchQuery)
    );
  }
};

watch(dialog, val => {
  if (!val) close();
});
watch(dialogDelete, val => {
  if (!val) closeDelete();
});
</script>

<style scoped>
.ementa-cell {
  white-space: normal;
  word-break: break-word;
  max-width: 800px;
}

.custom-width {
  height: 48px;
  width: 100px
}

.custom-width-2 {
  height: 48px;
  width: 200px;
}
</style>`
        );
    }
}