<template>
  <v-container>
    <v-row class="text-center" style="margin-top: 10px">
      <v-col cols="12">
        <v-card elevation="8">
          <v-label
            >Valor Total: R${{ valorTotal.toFixed(2) }}
            <strong v-if="valorTotal > 608 && valorTotal < 638">😰</strong>
            <strong v-if="valorTotal > 638">😱</strong>
            <strong v-if="valorTotal > 638">Valor em outros meios: R${{ (valorTotal - 638).toFixed(2) }}</strong>
          </v-label>
          <v-form ref="form" v-model="valid">
            <v-row style="padding-left: 30px; padding-right: 30px">
              <v-col cols="12" xs="12" sm="6" lg="6" md="6">
                <v-text-field
                  label="Nome da Lista"
                  dense
                  outlined
                  v-model="nameList"
                  required
                  :rules="[(v) => !!v || 'Este campo é obrigatório']"
                />
              </v-col>
              <v-col cols="12" xs="12" sm="6" lg="6" md="6">
                <v-text-field
                  label="Senha"
                  dense
                  outlined
                  type="password"
                  v-model="password"
                  required
                  :rules="[(v) => !!v || 'Este campo é obrigatório']"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn color="blue" @click="Get()" class="white--text"
                  >Pesquisar</v-btn
                >
              </v-col>
            </v-row>
            <v-row style="padding-left: 30px; padding-right: 30px">
              <v-col cols="12" xs="12" sm="4" lg="4" md="4">
                <v-text-field
                  label="Item"
                  dense
                  outlined
                  v-model="item"
                  required
                  :rules="[(v) => !!v || 'Este campo é obrigatório']"
                />
              </v-col>
              <v-col cols="12" xs="12" sm="4" lg="4" md="4">
                <v-text-field
                  label="Valor"
                  dense
                  outlined
                  type="text"
                  prefix="R$"
                  v-model="valorInput"
                  @input="onValorInput"
                  required
                  :rules="[(v) => !!v || 'Este campo é obrigatório']"
                />
              </v-col>
              <v-col cols="12" xs="12" sm="4" lg="4" md="4">
                <v-text-field
                  label="Quantidade"
                  type="number"
                  dense
                  outlined
                  v-model="quantidade"
                  required
                  :rules="[(v) => !!v || 'Este campo é obrigatório']"
                />
              </v-col>
            </v-row>
          </v-form>
          <v-row>
            <v-col cols="12">
              <v-btn color="blue" @click="Add()" class="white--text"
                >Adicionar</v-btn
              >
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
              'items-per-page-text': 'Produtos Por Página',
            }"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <!-- <template v-slot:footer.page-text="items">
              {{ items.pageStart }} - {{ items.pageStop }} de
              {{ items.itemsLength }} páginas
            </template> -->
            <template v-slot:no-data>
              <span>Sem produtos adicionados</span>
            </template>
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template v-slot:item.actions="{ item }">
              <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HelloWorld",

  data: () => ({
    valid: true,
    item: null,
    valor: 0,
    valorInput: "0,00",
    quantidade: 1,
    valorTotal: 0,
    headers: [
      { text: "Item", value: "item", sortable: true, align: "center" },
      {
        text: "Quantidade",
        align: "center",
        sortable: true,
        value: "quantidade",
      },
      {
        text: "Valor Unitário",
        value: "valorUnitario",
        sortable: true,
        align: "center",
      },
      { text: "Valor", value: "valor", sortable: true, align: "center" },
      { text: "Excluir", value: "actions", sortable: false, align: "center" },
    ],
    items: [],
  }),
  methods: {
    async Get() {
      if (this.password && this.nameList) {
        const response = await fetch(
          `/.netlify/functions/compras?chave=${this.nameList}&senha=${this.password}`
        );
        this.items = await response.json();
        await this.calculaValorTotal();
        await this.$refs.form.resetValidation();
      }
    },
    async Add() {
      if (this.$refs.form.validate()) {
        console.log(this.valor, this.quantidade);
        console.log(Number(this.valor), parseInt(this.quantidade));
        await fetch("/.netlify/functions/compras", {
          method: "POST",
          body: JSON.stringify({
            chave: this.nameList,
            senha: this.password,
            item: {
              quantidade: this.quantidade,
              item: this.item,
              valor: this.valor * parseInt(this.quantidade),
              valorUnitario: this.valor,
            },
          }),
          headers: { "Content-Type": "application/json" },
        });
        this.item = null;
        this.valor = 0;
        this.valorInput = "0,00";
        this.quantidade = 1;
        this.valid = true;
        this.$refs.form.valid = true;
        this.Get();
        this.calculaValorTotal();
        this.$refs.form.resetValidation();
      }
    },

    calculaValorTotal() {
      let valor = 0;
      console.log(this.items);
      this.items.forEach((item) => {
        console.log(item);
        valor = valor + item.valor;
      });
      this.valorTotal = valor;
    },

    async deleteItem(item) {
      try {
        let index = this.items.indexOf(item);
        console.log(item, index);
        const response = await fetch(`/.netlify/functions/compras`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chave: this.nameList, senha: this.password, itemIndex: index }),
        });

        const result = await response.json();
        this.Get();
        this.calculaValorTotal();

        if (response.ok) {
          console.log("✅ Item deletado com sucesso:", result);
        } else {
          console.error("❌ Erro ao deletar item:", result);
        }
      } catch (error) {
        console.error("❌ Erro na requisição:", error);
      }
    },
    onValorInput(e) {
      let raw = typeof e === "string" ? e : e.target.value

      // pega só números
      let digits = raw.replace(/\D/g, "")

      if (digits === "") {
        this.valor = 0
        this.valorInput = "0,00"
        return
      }

      // garante pelo menos 3 dígitos
      while (digits.length < 3) {
        digits = "0" + digits
      }

      // separa parte inteira e decimal
      const intPart = digits.slice(0, -2)
      const decPart = digits.slice(-2)

      // valor numérico em reais
      this.valor = parseFloat(intPart + "." + decPart)

      // formata exibição
      this.valorInput =
        parseInt(intPart, 10).toLocaleString("pt-BR") + "," + decPart
    }
  },
};
</script>
