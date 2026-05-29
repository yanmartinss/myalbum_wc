import csv from "csvtojson";
import path from "path";
import { prisma } from "../../lib/prisma.js";

export async function importCsv() {
  try {
    const count = await prisma.sticker.count();
    if (count > 0) {
      console.log(
        `ℹ️ O catálogo já possui ${count} figurinhas. Pulando sincronização.`,
      );
      return;
    }

    const csvPath = path.resolve(process.cwd(), "assets", "jogadores.csv");
    console.log(`🚀 Banco vazio. Lendo arquivo em: ${csvPath}`);

    let rows: any[];
    try {
      rows = await csv({ noheader: true, delimiter: ";" }).fromFile(csvPath);
    } catch (err) {
      console.error(
        "❌ Erro ao ler o arquivo CSV. Verifique se ele está na pasta 'assets'.",
      );
      return;
    }

    const groupLetters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
    ];
    const stickersToInsert: any[] = [];

    function processRow(columns: any, countryName: string, groupName: string) {
      const values = Object.values(columns) as string[];
      for (let j = 1; j < values.length; j++) {
        const code = values[j]?.trim();
        if (code && code !== "" && code !== "0" && code !== "1") {
          stickersToInsert.push({
            code,
            country: countryName.trim(),
            group: groupName,
          });
        }
      }
    }
    if (rows[0]) {
      processRow(rows[0], "FIFA World Cup", "Especiais");
    }

    for (let i = 1; i <= 48; i++) {
      if (!rows[i]) continue;

      const values = Object.values(rows[i]) as string[];
      const countryName: string = values[0] ?? "Unknown";

      const groupIndex = Math.floor((i - 1) / 4);
      const groupName = `Grupo ${groupLetters[groupIndex]}`;

      processRow(rows[i], countryName, groupName);
    }

    const penultima = rows[rows.length - 2];
    const ultima = rows[rows.length - 1];

    if (penultima) {
      const countryName = (Object.values(penultima)[0] as string) || "Extras";
      processRow(penultima, countryName, "Extras");
    }
    if (ultima) {
      const countryName = (Object.values(ultima)[0] as string) || "Extras";
      processRow(ultima, countryName, "Extras");
    }

    if (stickersToInsert.length > 0) {
      console.log(`🔄 Sincronizando ${stickersToInsert.length} figurinhas...`);

      await prisma.sticker.createMany({
        data: stickersToInsert,
        skipDuplicates: true,
      });

      console.log("✅ Catálogo de figurinhas atualizado!");
    }
  } catch (err) {
    console.error("❌ Erro crítico na importação do CSV:", err);
  }
}
