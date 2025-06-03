import path from "path";
import { checkFileContent, checkIsDir, checkIsFile } from "../../../checkers";
import { KanbanChecker } from "./kanban/KanbanChecker";
import { UserProfileChecker } from "./userprofile/UserProfileChecker";


export class AppsChecker{
    constructor(private localPath: string) { checkIsDir(this.localPath); }

    public appsCheckers() {
        const checkKanban = new KanbanChecker(path.join(this.localPath, 'kanban'));
        checkKanban.kanbanCheckers();

        const checkUserProfile = new UserProfileChecker(path.join(this.localPath, 'userprofile'));
        checkUserProfile.userprofileCheckers();

        checkIsFile(path.join(this.localPath, 'blog.ts'));
        checkFileContent(path.join(this.localPath, 'blog.ts'), 
        `import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';
import type { blogpostType } from '@/types/apps/BlogTypes';

interface blogTypeDe {
    blogposts: blogpostType[];
    recentPosts: blogpostType[];
    blogSearch: string;
    sortBy: string;
    selectedPost: blogpostType[] | any;
}

export const useBlogStore = defineStore({
    id: 'blog',

    state: (): blogTypeDe => ({
        blogposts: [],
        recentPosts: [],
        blogSearch: '',
        sortBy: 'newest',
        selectedPost: []
    }),
    getters: {
        // Get Post from Getters
        getPosts(state) {
            return state.blogposts;
        }
    },
    actions: {
        // Fetch Blog from action
        async fetchPosts() {
            try {
                const data = await axios.get('/api/data/blog/BlogPosts');
                this.blogposts = data.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        async fetchPost(title: string) {
            try {
                const response = await axios.post('/api/data/blog/post', { title });
                this.selectedPost = response.data.post;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});`    );

        checkIsFile(path.join(this.localPath, 'chat.ts'));
        checkFileContent(path.join(this.localPath, 'chat.ts'),
        `import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';
import { uniqueId } from 'lodash';
import { sub } from 'date-fns';

interface chatType {
    chats: any;
    chatContent: any;
}

export const useChatStore = defineStore({
    id: 'chat',
    state: (): chatType => ({
        chats: [],
        chatContent: 1
    }),
    getters: {
        // Get Chats from Getters
        // getChats(state) {
        //     return state.chats;
        // }
    },
    actions: {
        // Fetch Chat from action
        async fetchChats() {
            try {
                const data = await axios.get('/api/data/chat/ChatData');
                this.chats = data.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        //select chat
        SelectChat(itemID: number) {
            this.chatContent = itemID;
        },
        sendMsg(itemID: number, item: string) {
            const newMessage = {
                id: itemID,
                msg: item,
                type: 'text',
                attachments: [],
                createdAt: sub(new Date(), { seconds: 1 }),
                senderId: itemID
            };

            this.chats = this.chats.filter((chat: any) => {
                return chat.id === itemID
                    ? {
                          ...chat,
                          ...chat.chatHistory.push(newMessage)
                      }
                    : chat;
            });
        }
    }
});`    );

        checkIsFile(path.join(this.localPath, 'contact.ts'));
        checkFileContent(path.join(this.localPath, 'contact.ts'),
        `import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';

export const useContactStore = defineStore({
    id: 'Contact',
    state: () => ({
        contacts: []
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchContacts() {
            try {
                const response = await axios.get('/api/contacts');
                this.contacts = response.data.contacts;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});`    );

        checkIsFile(path.join(this.localPath, 'notes.ts'));
        checkFileContent(path.join(this.localPath, 'notes.ts'),
        `import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';
import { map } from 'lodash';

interface NotesType {
    id?: number | any;
    color?: string;
    title?: string;
    datef?: Date | any;
    deleted?: boolean;
}

interface noteType {
    notes: NotesType[];
    notesContent: number;
    noteSearch: string;
}

export const useNoteStore = defineStore({
    id: 'notes',
    state: (): noteType => ({
        notes: [],
        notesContent: 1,
        noteSearch: ''
    }),
    actions: {
        // Fetch notes
        async fetchNotes() {
            try {
                const data = await axios.get('/api/data/notes/NotesData');
                this.notes = data.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },

        //select chat
        SelectNote(itemID: number) {
            this.notesContent = itemID;
        },

        deleteNote(itemID: number) {
            const index = this.notes.findIndex((p) => p.id == itemID);
            this.notes.splice(index, 1);
        },
        updateNote(itemID: number, itemColor: any) {
            this.notes = map(this.notes, (note: any) => {
                if (note.id === itemID) {
                    return {
                        ...note,
                        color: itemColor
                    };
                }
                return note;
            });
        }
    }
});`    );

        checkIsFile(path.join(this.localPath, 'eCommerce.ts'));
        checkFileContent(path.join(this.localPath, 'eCommerce.ts'), 
        `import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';
// types
import type { ProductStateProps } from '@/types/apps/EcommerceType';
import { filter, map, sum } from 'lodash';

export const useEcomStore = defineStore({
    id: 'eCommerceone',
    state: (): ProductStateProps => ({
        products: [],
        cart: [],
        gender: '',
        category: [],
        price: '',
        subTotal: 0,
        discount: 5,
        total: 0,
        addresses: [],
        color: 'All',
    }),
    getters: {},
    actions: {
        // Fetch Customers from action
        async fetchProducts() {
            try {
                const data = await axios.get('/api/products/list');
                this.products = data.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        // Fetch Customers from addresses
        async fetchAddress() {
            try {
                const data = await axios.get('/api/address/list');
                this.addresses = data.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        //select gender
        SelectGender(items: any) {
            this.gender = items;
        },
        sortByColor(itemcolor: string) {
            this.color = itemcolor;
        },
        //select category
        SelectCategory(items: any) {
            this.category = items;
        },
        //select Price
        SelectPrice(items: any) {
            this.price = items;
        },
        //AddToCart
        AddToCart(item: any) {
            const product = item;
            this.cart = [...this.cart, product];
        },
        //qty
        incrementQty(item: any) {
            const productId = item;
            const updateCart = map(this.cart, (product: any) => {
                if (product.id === productId) {
                    return {
                        ...product,
                        qty: product.qty + 1
                    };
                }
                return product;
            });
            this.cart = updateCart;
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
            this.discount = Math.round(this.subTotal * (5 / 100));
            this.total = this.subTotal - this.discount;
        },
        //qty
        decrementQty(item: any) {
            const productId = item;
            const updateCart = map(this.cart, (product: any) => {
                if (product.id === productId) {
                    return {
                        ...product,
                        qty: product.qty - 1
                    };
                }
                return product;
            });
            this.cart = updateCart;
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
            this.discount = Math.round(this.subTotal * (5 / 100));
            this.total = this.subTotal - this.discount;
        },
        // delete Cart
        deleteCart(item: any) {
            const updateCart = filter(this.cart, (p) => p.id !== item);
            this.cart = updateCart;
        },
        //subtotal
        getsubTotal() {
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
        },
        //total
        getTotal() {
            this.total = this.subTotal - this.discount;
        },
        //discount
        getDiscount() {
            this.discount = Math.round(this.subTotal * (5 / 100));
        },

        //Reset Filter
        filterReset(){}


    }
});`    );

    }
}