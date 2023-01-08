<template>
  <v-container>
    <v-row class="text-center" style="margin-top: 10px">
      <v-col cols="12">
        <v-card elevation="8">
          <v-label>Valor Total: R${{valorTotal}} <strong v-if="valorTotal > 300">😰</strong> </v-label>
          <v-form ref="form" v-model="valid">
            <v-row style="padding-left: 30px; padding-right: 30px">
            
              <v-col cols=12 xs="12" sm="4" lg="4" md="4">
                <v-text-field label="Item" dense outlined v-model="item" required :rules="[v => !!v || 'Este campo é obrigatório']"/>
              </v-col>
              <v-col cols=12 xs="12" sm="4" lg="4" md="4">
                <v-text-field label="Valor" dense outlined type="number" prefix="R$" v-model="valor" required :rules="[v => !!v || 'Este campo é obrigatório']"/>
              </v-col>
              <v-col cols=12 xs="12" sm="4" lg="4" md="4">
                <v-text-field label="Quantidade" type="number" dense outlined v-model="quantidade" required :rules="[v => !!v || 'Este campo é obrigatório']"/>
              </v-col>
          </v-row>
            </v-form>
          <v-row>
            <v-col cols="12">
              <v-btn color="blue" @click="Add()" class="white--text" >Adicionar</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="text-center">
      <v-col cols="12">
        <v-card elevation="5">
        <v-data-table
        :headers="headers"
        :items="items"
        :footer-props="{
          'items-per-page-text':'Produtos Por Página'
        }">
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:footer.page-text="items"> {{ items.pageStart }} - {{ items.pageStop }} de {{ items.itemsLength }} páginas </template>
          <template v-slot:no-data>
            <span>Sem produtos adicionados</span>
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.actions="{ item }">  
            <v-icon
              small
              @click="deleteItem(item)"
            >
            mdi-delete
          </v-icon>
        </template></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'HelloWorld',

    data: () => ({
      valid: true,
      item: null,
      valor: null,
      quantidade: null,
      valorTotal: 0,
      headers: [
          { text: 'Item',
            value: 'item',
            sortable: true,
            align: 'center'
          },
          {
            text: 'Quantidade',
            align: 'center',
            sortable: true,
            value: 'quantidade',
          },
          { text: 'Valor Unitário',
            value: 'valorUnitario',
            sortable: true,
            align: 'center'
          },
          { text: 'Valor',
            value: 'valor',
            sortable: true,
            align: 'center'
          },
          { text: 'Excluir',
            value: 'actions',
            sortable: false,
            align: 'center'
          }
      ],
      items: []

    }),
    methods: {
      Add() {
        if (this.$refs.form.validate()) {
          this.items.push({quantidade: this.quantidade, item: this.item, valor: this.valor * this.quantidade, valorUnitario: this.valor})
          this.item = null;
          this.valor = null;
          this.quantidade = null;
          this.valid = true;
          this.$refs.form.valid = true;
          this.calculaValorTotal();
          this.$refs.form.resetValidation()
        }

      },

      calculaValorTotal() {
        let valor = 0
        this.items.forEach(item => {
          valor = valor + item.valor
        });
        this.valorTotal = valor;
      },

      deleteItem (item) {
        let index = this.items.indexOf(item);
        this.items.splice(index, 1);
        this.calculaValorTotal();
      },
    }
  }
</script>
