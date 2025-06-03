import path from "path";
import { checkFileContent, checkIsDir, checkIsFile } from "../../../../checkers";


export class UserProfileChecker{
    constructor(private localPath: string) { checkIsDir(this.localPath); }

    public userprofileCheckers() {
        checkIsFile(path.join(this.localPath, 'followers.ts'));
        checkFileContent(path.join(this.localPath, 'followers.ts'), `import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';

export const useFollowersStore = defineStore({
    id: 'followers',
    state: () => ({
        followers: []
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchFollowers() {
            try {
                const response = await axios.get('/api/followers/list');
                this.followers = response.data.followers;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});`    );

        checkIsFile(path.join(this.localPath, 'friends.ts'));
        checkFileContent(path.join(this.localPath, 'friends.ts'), `import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';

export const useFrinedsStore = defineStore({
    id: 'Frineds',
    state: () => ({
        friends: []
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchFrineds() {
            try {
                const response = await axios.get('/api/friends/list');
                this.friends = response.data.friends;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});`    );

        checkIsFile(path.join(this.localPath, 'gallery.ts'));
        checkFileContent(path.join(this.localPath, 'gallery.ts'),`import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';

export const useGalleryStore = defineStore({
    id: 'Gallery',
    state: () => ({
        gallery: []
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchGallery() {
            try {
                const response = await axios.get('/api/gallery/list');
                this.gallery = response.data.gallery;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});`    );

        checkIsFile(path.join(this.localPath, 'photos.ts'));
        checkFileContent(path.join(this.localPath, 'photos.ts'), 
`import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';

export const usePhotosStore = defineStore({
    id: 'Photos',
    state: () => ({
        photos: []
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchPhotos() {
            try {
                const response = await axios.get('/api/photos');
                this.photos = response.data.photos;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});`
        );

        checkIsFile(path.join(this.localPath, 'posts.ts'));
        checkFileContent(path.join(this.localPath, 'posts.ts'),
`import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';
import type { Reply } from '@/types/apps/PostType';

export const usePostsStore = defineStore({
    id: 'post',
    state: () => ({
        posts: []
    }),
    getters: {},
    actions: {
        // Fetch Posts from action
        async fetchPosts() {
            try {
                const response = await axios.get('/api/posts/list');
                this.posts = response.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        // like post
        async likePost(postId: string) {
            try {
                const response = await axios.post('/api/posts/list/like', { postId });
                this.posts = response.data.posts;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        // add Comment
        async addComment(postId: string, comment: Reply) {
            try {
                const response = await axios.post('/api/comments/add', { postId, comment });
                this.posts = response.data.posts;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        // add Comment
        async addReply(postId: string, commentId: string, reply: Reply) {
            try {
                const response = await axios.post('/api/replies/add', { postId, commentId, reply });
                this.posts = response.data.posts;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});` 
        );

    }

}