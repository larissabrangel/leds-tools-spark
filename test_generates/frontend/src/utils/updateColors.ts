import { computed } from 'vue';
import * as themeColors from '@/theme/LightTheme';
import * as DarkThemeColors from '@/theme/DarkTheme';
import { useCustomizerStore } from '@/stores/customizer';

const custmizer = useCustomizerStore();

const getPrimary = computed(() => {
    if (custmizer.actTheme === 'RED_THEME') {
        return themeColors.RED_THEME.colors.primary;
    } else if (custmizer.actTheme === 'PURPLE_THEME') {
        return themeColors.PURPLE_THEME.colors.primary;
    } else if (custmizer.actTheme === 'GREEN_THEME') {
        return themeColors.GREEN_THEME.colors.primary;
    } else if (custmizer.actTheme === 'INDIGO_THEME') {
        return themeColors.INDIGO_THEME.colors.primary;
    } else if (custmizer.actTheme === 'ORANGE_THEME') {
        return themeColors.ORANGE_THEME.colors.primary;
    } else if (custmizer.actTheme === 'DARK_RED_THEME') {
        return DarkThemeColors.DARK_RED_THEME.colors.primary;
    } else if (custmizer.actTheme === 'DARK_PURPLE_THEME') {
        return DarkThemeColors.DARK_PURPLE_THEME.colors.primary;
    } else if (custmizer.actTheme === 'DARK_GREEN_THEME') {
        return DarkThemeColors.DARK_GREEN_THEME.colors.primary;
    } else if (custmizer.actTheme === 'DARK_INDIGO_THEME') {
        return DarkThemeColors.DARK_INDIGO_THEME.colors.primary;
    } else if (custmizer.actTheme === 'DARK_ORANGE_THEME') {
        return DarkThemeColors.DARK_ORANGE_THEME.colors.primary;
    } else if (custmizer.actTheme === 'DARK_BLUE_THEME') {
        return DarkThemeColors.DARK_BLUE_THEME.colors.primary;
    } else {
        return themeColors.BLUE_THEME.colors.primary;
    }
});

const getLightPrimary = computed(() => {
    if (custmizer.actTheme === 'RED_THEME') {
        return themeColors.RED_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'PURPLE_THEME') {
        return themeColors.PURPLE_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'GREEN_THEME') {
        return themeColors.GREEN_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'INDIGO_THEME') {
        return themeColors.INDIGO_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'ORANGE_THEME') {
        return themeColors.ORANGE_THEME.colors.lightprimary;
    }
    if (custmizer.actTheme === 'DARK_RED_THEME') {
        return DarkThemeColors.DARK_RED_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'DARK_PURPLE_THEME') {
        return DarkThemeColors.DARK_PURPLE_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'DARK_GREEN_THEME') {
        return DarkThemeColors.DARK_GREEN_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'DARK_INDIGO_THEME') {
        return DarkThemeColors.DARK_INDIGO_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'DARK_ORANGE_THEME') {
        return DarkThemeColors.DARK_ORANGE_THEME.colors.lightprimary;
    } else if (custmizer.actTheme === 'DARK_BLUE_THEME') {
        return DarkThemeColors.DARK_BLUE_THEME.colors.lightprimary;
    } else {
        return themeColors.BLUE_THEME.colors.lightprimary;
    }
});

const getSecondary = computed(() => {
    if (custmizer.actTheme === 'RED_THEME') {
        return themeColors.RED_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'PURPLE_THEME') {
        return themeColors.PURPLE_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'GREEN_THEME') {
        return themeColors.GREEN_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'INDIGO_THEME') {
        return themeColors.INDIGO_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'ORANGE_THEME') {
        return themeColors.ORANGE_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'DARK_RED_THEME') {
        return DarkThemeColors.DARK_RED_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'DARK_PURPLE_THEME') {
        return DarkThemeColors.DARK_PURPLE_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'DARK_GREEN_THEME') {
        return DarkThemeColors.DARK_GREEN_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'DARK_INDIGO_THEME') {
        return DarkThemeColors.DARK_INDIGO_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'DARK_ORANGE_THEME') {
        return DarkThemeColors.DARK_ORANGE_THEME.colors.secondary;
    } else if (custmizer.actTheme === 'DARK_BLUE_THEME') {
        return DarkThemeColors.DARK_BLUE_THEME.colors.secondary;
    } else {
        return themeColors.BLUE_THEME.colors.secondary;
    }
});

const getLightSecondary = computed(() => {
    if (custmizer.actTheme === 'RED_THEME') {
        return themeColors.RED_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'PURPLE_THEME') {
        return themeColors.PURPLE_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'GREEN_THEME') {
        return themeColors.GREEN_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'INDIGO_THEME') {
        return themeColors.INDIGO_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'ORANGE_THEME') {
        return themeColors.ORANGE_THEME.colors.lightsecondary;
    } if (custmizer.actTheme === 'DARK_RED_THEME') {
        return DarkThemeColors.DARK_RED_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'DARK_PURPLE_THEME') {
        return DarkThemeColors.DARK_PURPLE_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'DARK_GREEN_THEME') {
        return DarkThemeColors.DARK_GREEN_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'DARK_INDIGO_THEME') {
        return DarkThemeColors.DARK_INDIGO_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'DARK_ORANGE_THEME') {
        return DarkThemeColors.DARK_ORANGE_THEME.colors.lightsecondary;
    } else if (custmizer.actTheme === 'DARK_BLUE_THEME') {
        return DarkThemeColors.DARK_BLUE_THEME.colors.lightsecondary;
    } else {
        return themeColors.BLUE_THEME.colors.lightsecondary;
    }
});

const getLight100 = computed(() => {
    if (
        custmizer.actTheme === 'RED_THEME' ||
        custmizer.actTheme === 'PURPLE_THEME' ||
        custmizer.actTheme === 'GREEN_THEME' ||
        custmizer.actTheme === 'INDIGO_THEME' ||
        custmizer.actTheme === 'ORANGE_THEME'
    ) {
        return themeColors.RED_THEME.colors.grey100;
    } else if (
        custmizer.actTheme === 'DARK_RED_THEME' ||
        custmizer.actTheme === 'DARK_PURPLE_THEME' ||
        custmizer.actTheme === 'DARK_GREEN_THEME' ||
        custmizer.actTheme === 'DARK_INDIGO_THEME' ||
        custmizer.actTheme === 'DARK_ORANGE_THEME' ||
        custmizer.actTheme === 'DARK_BLUE_THEME'
    ) {
        return DarkThemeColors.DARK_RED_THEME.colors.grey100;
    } else {
        return themeColors.BLUE_THEME.colors.grey100;
    }
});

export { getPrimary, getSecondary, getLightPrimary, getLightSecondary, getLight100 };