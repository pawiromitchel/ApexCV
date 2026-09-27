export const THEME_STORAGE_KEY = "apexcv-theme";

/**
 * Runs before first paint (inlined in <head>) so the page never flashes the wrong theme.
 * Lives outside the client provider module so the server layout can inline the string.
 */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
