<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <label>Walmart Calculator</label>
    </v-app-bar>

    <v-main style="background-color: grey">
      <HelloWorld/>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';


export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>
