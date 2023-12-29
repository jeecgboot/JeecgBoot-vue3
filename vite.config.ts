import type { UserConfig, ConfigEnv } from 'vite';
import pkg from './package.json';
import dayjs from 'dayjs';
import { loadEnv } from 'vite';
import { resolve } from 'path';
import { generateModifyVars } from './build/generate/generateModifyVars';
import { createProxy } from './build/vite/proxy';
import { wrapperEnv } from './build/utils';
import { createVitePlugins } from './build/vite/plugin';
import { OUTPUT_DIR } from './build/constant';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();

  const env = loadEnv(mode, root);

  // The boolean type read by loadEnv is a string. This function can be converted to boolean type
  const viteEnv = wrapperEnv(env);

  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY } = viteEnv;

  const isBuild = command === 'build';

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        // /@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        // /#/xxxx => types/xxxx
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
        {
          find: /@\//,
          replacement: pathResolve('src') + '/',
        },
        // /#/xxxx => types/xxxx
        {
          find: /#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    server: {
      // Listening on all local IPs
      host: true,
      https: false,
      port: VITE_PORT,
      // Load proxy configuration from .env
      proxy: createProxy(VITE_PROXY),
    },
    build: {
      minify: 'esbuild',
      target: 'es2015',
      cssTarget: 'chrome80',
      outDir: OUTPUT_DIR,
      rollupOptions: {
        // 关闭除屑优化，防止删除重要代码，导致打包后功能出现异常
        treeshake: false,
        output: {
          chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
          entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
          // manualChunks配置 (依赖包从大到小排列)
          manualChunks: {
            'tinymce-vendor': ['tinymce','@tinymce/tinymce-vue'],
            'echarts-vendor': ['echarts'],
            'antd-vue-vendor': ['ant-design-vue','@ant-design/icons-vue','@ant-design/colors'],
            'vxe-table-vendor': ['vxe-table','vxe-table-plugin-antd','xe-utils'],
            'codemirror-vendor': ['codemirror'],
            //'emoji-mart-vue-fast': ['emoji-mart-vue-fast'],
            'jeecg-online-vendor': ['@jeecg/online'],
            // 将 Lodash 库的代码单独打包
            'lodash-es-vendor': ['lodash-es'],
            'html2canvas-vendor': ['html2canvas'],
            // vue vue-router合并打包
            vue: ['vue', 'vue-router'],
            'cron-parser-vendor': ['cron-parser'],
          },
        }
      },
      // 关闭brotliSize显示可以稍微减少打包时间
      reportCompressedSize: false,
      // 提高超大静态资源警告大小
      chunkSizeWarningLimit: 2000,
    },
    esbuild: {
      //清除全局的console.log和debug
      drop: isBuild ? ['console', 'debugger'] : [],
    },
    define: {
      // setting vue-i18-next
      // Suppress warning
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: generateModifyVars(),
          javascriptEnabled: true,
        },
      },
    },

    // The vite plugin used by the project. The quantity is large, so it is separately extracted and managed
    plugins: createVitePlugins(viteEnv, isBuild),
    // 预加载构建配置（首屏性能)
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
      exclude: [
        //升级vite4后，需要排除online依赖
        '@jeecg/online',
      ],
      // 提前预加载依赖，缩短首屏访问时间
      include: [
        '@vue/runtime-core',
        '@vue/shared',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
        '@ant-design/colors',
        '@ant-design/icons-vue',
        '@vueuse/core',
        '@vueuse/shared',
        '@zxcvbn-ts/core',
        'ant-design-vue',
        'axios',
        'china-area-data',
        'clipboard',
        'codemirror',
        'codemirror/addon/fold/brace-fold.js',
        'codemirror/addon/fold/comment-fold.js',
        'codemirror/addon/fold/foldcode.js',
        'codemirror/addon/fold/foldgutter.js',
        'codemirror/addon/fold/indent-fold.js',
        'codemirror/addon/hint/anyword-hint.js',
        'codemirror/addon/hint/show-hint.js',
        'codemirror/addon/selection/active-line.js',
        'codemirror/mode/clike/clike.js',
        'codemirror/mode/css/css.js',
        'codemirror/mode/javascript/javascript.js',
        'codemirror/mode/markdown/markdown.js',
        'codemirror/mode/python/python.js',
        'codemirror/mode/r/r.js',
        'codemirror/mode/shell/shell.js',
        'codemirror/mode/sql/sql.js',
        'codemirror/mode/swift/swift.js',
        'codemirror/mode/vue/vue.js',
        'codemirror/mode/xml/xml.js',
        'cron-parser',
        'cropperjs',
        'crypto-js/aes',
        'crypto-js/enc-base64',
        'crypto-js/enc-utf8',
        'crypto-js/md5',
        'crypto-js/mode-ecb',
        'crypto-js/pad-pkcs7',
        'dom-align',
        'echarts',
        'echarts/charts',
        'echarts/components',
        'echarts/core',
        'echarts/renderers',
        'emoji-mart-vue-fast/src',
        'intro.js',
        'lodash-es',
        'md5',
        'path-to-regexp',
        'pinia',
        'print-js',
        'qrcode',
        'qs',
        'resize-observer-polyfill',
        'showdown',
        'sortablejs',
        'tinymce/icons/default/icons',
        'tinymce/plugins/advlist',
        'tinymce/plugins/anchor',
        'tinymce/plugins/autolink',
        'tinymce/plugins/autosave',
        'tinymce/plugins/code',
        'tinymce/plugins/codesample',
        'tinymce/plugins/directionality',
        'tinymce/plugins/fullscreen',
        'tinymce/plugins/image',
        'tinymce/plugins/insertdatetime',
        'tinymce/plugins/link',
        'tinymce/plugins/lists',
        'tinymce/plugins/media',
        'tinymce/plugins/nonbreaking',
        'tinymce/plugins/pagebreak',
        'tinymce/plugins/preview',
        'tinymce/plugins/save',
        'tinymce/plugins/searchreplace',
        'tinymce/plugins/table',
        'tinymce/plugins/template',
        'tinymce/plugins/visualchars',
        'tinymce/plugins/wordcount',
        'tinymce/themes/silver',
        'tinymce/tinymce',
        'vditor',
        'vue',
        'vue-i18n',
        'vue-print-nb-jeecg/src/printarea',
        'vue-router',
        'vue-types',
        'vxe-table',
        'vxe-table-plugin-antd',
        'xe-utils',
        'xss',
      ],
    },
  };
};
