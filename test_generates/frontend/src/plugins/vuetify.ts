import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as directives from 'vuetify/directives';
//DragScroll
import { VueDraggableNext } from 'vue-draggable-next';

// import { BLUE_THEME} from '@/theme/LightTheme';
import { BLUE_THEME } from '@/theme/LightTheme';
export default createVuetify({
    components: {
        draggable: VueDraggableNext,
      },
    directives,

    theme: {
        defaultTheme: 'BLUE_THEME',
        themes: {
            BLUE_THEME,


        }
    },
    defaults: {
        VCard: {
            rounded: 'md'
        },
        VTextField: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary'
        },
        VTextarea: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary'
        },
        VSelect: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary'
        },
        VListItem: {
            minHeight: '45px'
        },
        VTooltip: {
            location: 'top'
        }
    }
});