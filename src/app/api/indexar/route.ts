import { NextResponse } from "next/server";
import { indexarTodasEmpresas, indexarTodasEmpresasAdaptativa } from "@/lib/indexers";
import { indexarEmpresaAdaptativa } from "@/lib/indexers/adaptive-indexer";
import { db } from "@/lib/db";

// GET /api/indexar - Indexa todas as empresas
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  try {
    if (ticker) {
      // Indexar empresa específica
      const empresa = await db.empresa.findUnique({
        where: { ticker: ticker.toUpperCase() },
      });

      if (!empresa) {
        return NextResponse.json(
          { error: `Empresa ${ticker} não encontrada` },
          { status: 404 }
        );
      }

      // Usar sistema adaptativo (multi-método)
      const result = await indexarEmpresaAdaptativa(empresa.id);
      return NextResponse.json({
        success: true,
        message: `Indexação adaptativa de ${ticker} concluída`,
        result: {
          empresaId: result.empresaId,
          ticker: result.ticker,
          fonte: result.melhorMetodo || "nenhum",
          novosAudios: result.novosAudios,
          metodosTentados: result.metodos.length,
          metodosComSucesso: result.metodos.filter(m => m.sucesso).length,
          melhorMetodo: result.melhorMetodo,
          detalhesMetodos: result.metodos.map(m => ({
            metodo: m.metodo,
            sucesso: m.sucesso,
            audiosEncontrados: m.audios.length,
            tempo: m.tempo,
            erro: m.erro,
          })),
          erros: result.erros,
        },
      });
    }

    // Indexar todas usando sistema adaptativo
    const results = await indexarTodasEmpresasAdaptativa();
    const totalNovos = results.reduce((acc, r) => acc + r.novosAudios, 0);
    const empresasComSucesso = results.filter(r => r.novosAudios > 0).length;

    return NextResponse.json({
      success: true,
      message: `Indexação adaptativa concluída`,
      totalEmpresas: results.length,
      empresasComSucesso,
      totalNovosAudios: totalNovos,
      detalhes: results,
    });
  } catch (error) {
    console.error("Erro na indexação:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}



