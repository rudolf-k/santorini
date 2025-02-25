/// <reference types="vite/client" />
// declare module "*.vue" {
//   import Vue from "vue";
//   export default Vue;
// }

declare module "*.vue" {
  // NOTE: ts-loader
  import { defineComponent } from "vue";

  const component: ReturnType<typeof defineComponent>;
  export default component;
}
