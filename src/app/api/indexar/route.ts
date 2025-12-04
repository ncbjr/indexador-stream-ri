import { NextResponse } from "next/server";
import { indexarTodasEmpresas, indexarEmpresa } from "@/lib/indexers";
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

      const result = await indexarEmpresa(empresa.id);
      return NextResponse.json({
        success: true,
        message: `Indexação de ${ticker} concluída`,
        result,
      });
    }

    // Indexar todas
    const results = await indexarTodasEmpresas();
    const totalNovos = results.reduce((acc, r) => acc + r.novosAudios, 0);

    return NextResponse.json({
      success: true,
      message: `Indexação concluída`,
      totalEmpresas: results.length,
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



