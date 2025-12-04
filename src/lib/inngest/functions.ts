import { inngest } from "./client";
import { indexarEmpresa, indexarTodasEmpresas } from "@/lib/indexers";
import { db } from "@/lib/db";

// Job para indexar uma empresa específica
export const indexarEmpresaJob = inngest.createFunction(
  {
    id: "indexar-empresa",
    name: "Indexar Empresa",
    retries: 3,
  },
  { event: "ri-stream/empresa.indexar" },
  async ({ event, step }) => {
    const { empresaId } = event.data;

    const result = await step.run("indexar", async () => {
      return indexarEmpresa(empresaId);
    });

    return {
      success: true,
      result,
    };
  }
);

// Job para indexar todas as empresas (executado diariamente)
export const indexarTodasEmpresasJob = inngest.createFunction(
  {
    id: "indexar-todas-empresas",
    name: "Indexar Todas as Empresas",
    retries: 1,
  },
  { cron: "0 6 * * *" }, // Todos os dias às 6h
  async ({ step }) => {
    const results = await step.run("indexar-todas", async () => {
      return indexarTodasEmpresas();
    });

    const totalNovos = results.reduce((acc, r) => acc + r.novosAudios, 0);
    const erros = results.filter((r) => r.erros.length > 0);

    return {
      success: true,
      totalEmpresas: results.length,
      totalNovosAudios: totalNovos,
      empresasComErros: erros.length,
      detalhes: results,
    };
  }
);

// Job para verificar novos conteúdos (a cada 4 horas)
export const verificarNovosConteudosJob = inngest.createFunction(
  {
    id: "verificar-novos-conteudos",
    name: "Verificar Novos Conteúdos",
    retries: 2,
  },
  { cron: "0 */4 * * *" }, // A cada 4 horas
  async ({ step }) => {
    // Buscar empresas que não foram indexadas nas últimas 4 horas
    const quatroHorasAtras = new Date(Date.now() - 4 * 60 * 60 * 1000);

    const empresasParaIndexar = await step.run(
      "buscar-empresas-pendentes",
      async () => {
        const empresas = await db.empresa.findMany();

        const empresasPendentes = [];
        for (const empresa of empresas) {
          const ultimoLog = await db.indexingLog.findFirst({
            where: { empresaId: empresa.id },
            orderBy: { createdAt: "desc" },
          });

          if (!ultimoLog || ultimoLog.createdAt < quatroHorasAtras) {
            empresasPendentes.push(empresa);
          }
        }

        return empresasPendentes;
      }
    );

    const results = [];
    for (const empresa of empresasParaIndexar) {
      const result = await step.run(
        `indexar-${empresa.ticker}`,
        async () => {
          return indexarEmpresa(empresa.id);
        }
      );
      results.push(result);
    }

    return {
      success: true,
      empresasIndexadas: results.length,
      resultados: results,
    };
  }
);

// Exportar todas as funções
export const functions = [
  indexarEmpresaJob,
  indexarTodasEmpresasJob,
  verificarNovosConteudosJob,
];

