import {
  summarizeReportRows,
  laboratoryErrors,
  depositTypes,
} from "./daily-summary.ts";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
export const reportMetadata = (value: any): Record<string, any> => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};
const val = (row: any, key: string, fallback: any = "") =>
  row?.[key] ?? row?.[key.toLowerCase()] ?? fallback;
const text = (v: any) =>
  (typeof v === "number"
    ? v.toLocaleString("pt-BR", {
        useGrouping: false,
        maximumFractionDigits: 6,
      })
    : String(v ?? "")
  )
    .normalize("NFC")
    .replace(/[\r\n\t]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
const num = (v: any) => {
  const result = Number(typeof v === "string" ? v.replace(",", ".") : (v ?? 0));
  return Number.isFinite(result) ? result : 0;
};
const date = (v: any) => String(v || "").slice(0, 10);
const br = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split("-").reverse().join("/") : v;
export function normalizeReportVisit(row: any) {
  const v = row.visita || row,
    b = reportMetadata(val(v, "BOLETIM_JSON", v.boletim));
  const samples = row.amostra || [],
    treatments = row.tratamento || [],
    inspections = row.inspecao || [];
  const sample = samples[0] || {};
  const focal = treatments.find((t: any) =>
    String(val(t, "TIPO")).startsWith("FOCAL:"),
  );
  const perifocal = treatments.find((t: any) =>
    String(val(t, "TIPO")).startsWith("PERIFOCAL:"),
  );
  const legacy = treatments.filter(
    (t: any) => !String(val(t, "TIPO")).match(/^(FOCAL|PERIFOCAL):/),
  );
  const focalRows = [focal || legacy[0]].filter(Boolean).map((t: any) => ({
    tipo: String(val(t, "TIPO")).replace(/^FOCAL:/, ""),
    gramas: b.focalGramas ?? "",
    depositos: val(t, "QTD_TRATAMENTO"),
  }));
  if (num(val(v, "CONTEM_TRATAMENTO", v.contemTratamento)) && b.focal2?.tipo)
    focalRows.push(b.focal2);
  const type = String(val(v, "TIPO_IMOVEL"));
  const types: Record<string, string> = {
    Residencial: "R",
    Comercial: "C",
    "Terreno baldio": "TB",
    "Ponto estratégico": "PE",
    Outros: "O",
  };
  const status = num(val(v, "SITUACAO_REFERENCIA", v.situacaoVisita));
  return {
    id: val(v, "ID"),
    date: date(val(v, "PRIMEIRA_VISITA", v.primeiraVisita)),
    agent: b.agenteNome || "",
    agentCode: b.agenteCodigo || "",
    status,
    b,
    values: {
      quart: b.quarteirao,
      seqQuart: b.sequenciaQuarteirao,
      lado: b.ladoQuarteirao,
      rua: val(v, "NOME", v.nome),
      numero: val(v, "NUMERO", v.numero) || "s/n",
      seqImovel: b.sequenciaImovel,
      complemento: val(v, "COMPLEMENTO", v.complemento),
      tipo: types[type] || type,
      hora: b.horaEntrada || String(val(v, "PRIMEIRA_VISITA")).slice(11, 16),
      visita: val(v, "TIPO_VISITA", v.tipoVisita),
      pendencia: status === 1 ? "F" : status === 2 ? "R" : "",
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7].map((i) => [
          "d" + i,
          inspections
            .filter((r: any) => num(val(r, "TIPO")) === i)
            .reduce(
              (n: number, r: any) => n + num(val(r, "NUMERO_DEPOSITOS")),
              0,
            ),
        ]),
      ),
      li: b.inspecionadoLI ? "X" : "",
      inicial: val(sample, "NUMERO_INICIO"),
      final: val(sample, "NUMERO_FINAL"),
      tubos: samples.reduce(
        (n: number, r: any) => n + num(val(r, "QUANTIDADE")),
        0,
      ),
      eliminados: treatments.reduce(
        (n: number, r: any) => n + num(val(r, "DEPOSITOS_ELIMINADOS")),
        0,
      ),
      imTrat: treatments.some((r: any) => num(val(r, "IMOVEIS_TRATADOS")) > 0)
        ? "X"
        : "",
      f1tipo: focalRows[0]?.tipo,
      f1gramas: focalRows[0]?.gramas,
      f1dep: focalRows[0]?.depositos,
      f2tipo: focalRows[1]?.tipo,
      f2gramas: focalRows[1]?.gramas,
      f2dep: focalRows[1]?.depositos,
      peritipo: perifocal
        ? String(val(perifocal, "TIPO")).replace(/^PERIFOCAL:/, "")
        : "",
      pericarga: perifocal ? val(perifocal, "QTD_CARGA") : "",
    },
  };
}
export const reportColumns = [
  ["quart", "Nº quarteirão", 24],
  ["seqQuart", "Seq. quarteirão", 17],
  ["lado", "Face / lado", 17],
  ["rua", "Nome do logradouro", 145],
  ["numero", "Nº imóvel", 30],
  ["seqImovel", "Seq. imóvel", 18],
  ["complemento", "Complemento", 42],
  ["tipo", "Tipo de imóvel", 21],
  ["hora", "Hora de entrada", 30],
  ["visita", "Visita N / R", 20],
  ["pendencia", "Pendência F / R", 20],
  ...["A1", "A2", "B", "C", "D1", "D2", "E"].map((c, i) => [
    "d" + (i + 1),
    c,
    18,
  ]),
  ["li", "Inspecionado (LI)", 20],
  ["inicial", "Amostra inicial", 24],
  ["final", "Amostra final", 24],
  ["tubos", "Qtd. tubitos", 24],
  ["eliminados", "Depósitos eliminados", 26],
  ["imTrat", "Imóvel tratado", 21],
  ["f1tipo", "L1 · tipo", 25],
  ["f1gramas", "L1 · gramas", 27],
  ["f1dep", "L1 · depósitos", 25],
  ["f2tipo", "L2 · tipo", 25],
  ["f2gramas", "L2 · gramas", 27],
  ["f2dep", "L2 · depósitos", 25],
  ["peritipo", "Adulticida · tipo", 27],
  ["pericarga", "Qtd. cargas", 25],
] as [string, string, number][];
export function reportIssues(
  plan: any,
  rows: any[],
  catalog: any,
  options: any = {},
) {
  const b = {
    ...reportMetadata(plan.boletimJson ?? plan.BOLETIM_JSON ?? plan.boletim),
    ...options,
  };
  const municipality = catalog.municipios.find(
    (m: any) =>
      m.value === Number(b.municipioIbge || plan.idCidade || plan.ID_CIDADE),
  );
  const issues: string[] = [];
  const originalCity = catalog.municipios.find(
    (m: any) => m.value === Number(plan.idCidade || plan.ID_CIDADE),
  );
  if (
    originalCity &&
    b.municipioIbge &&
    originalCity.value !== Number(b.municipioIbge)
  )
    issues.push(
      "O município deve corresponder ao cadastro do planejamento. Atualize o planejamento para mudar a cidade.",
    );
  if (b.data && !/^\d{4}-\d{2}-\d{2}$/.test(b.data))
    issues.push("Use a data no formato AAAA-MM-DD.");
  if (!municipality) issues.push("Selecione o município do boletim.");
  if (!(plan.nome || plan.descricao || plan.NOME))
    issues.push("Informe o nome da localidade.");
  if (!b.codigoLocalidade)
    issues.push("Informe o código da localidade reconhecido pela sede.");
  if (
    !catalog.atividades.some(
      (r: any) =>
        r.value === Number(b.atividade || plan.atividade || plan.ATIVIDADE),
    )
  )
    issues.push("Selecione a atividade PNCD.");
  if (
    !catalog.tipos.some(
      (r: any) =>
        r.value === Number(b.tipoLocalidade || plan.tipo || plan.TIPO),
    )
  )
    issues.push("Selecione o tipo da localidade.");
  if (
    !b.categoriaLocalidade &&
    !catalog.categorias.some(
      (r: any) => r.value === Number(plan.idCategoria || plan.ID_CATEGORIA),
    )
  )
    issues.push("Selecione a categoria da localidade.");
  if (
    (plan.ciclo ?? plan.CICLO ?? b.ciclo) == null ||
    (plan.ciclo ?? plan.CICLO ?? b.ciclo) === ""
  )
    issues.push("Informe o ciclo do trabalho.");
  const included = rows
    .map(normalizeReportVisit)
    .filter(
      (r: any) =>
        r.date &&
        [1, 2, 3].includes(r.status) &&
        (!b.data || r.date === b.data),
    );
  if (!included.length)
    issues.push("Não há atendimentos concluídos na data selecionada.");
  if (included.some((r: any) => !r.agent && !b.agenteNome))
    issues.push("Informe o agente dos registros sem identificação.");
  if (included.some((r: any) => !r.b.quarteirao))
    issues.push(
      "Preencha o quarteirão nas visitas que ainda não têm esse dado.",
    );
  if (included.some((r: any) => !r.b.ladoQuarteirao))
    issues.push("Preencha a face do quarteirão nas visitas.");
  if (
    included.some(
      (r: any) =>
        r.values.f1tipo &&
        (r.values.f1gramas === "" || r.values.f1gramas == null),
    )
  )
    issues.push(
      "Informe a quantidade de larvicida L1 em gramas nos dados do boletim da visita.",
    );
  if (included.some((r: any) => !["R","C","TB","PE","O"].includes(r.values.tipo)))
    issues.push("Preencha o tipo de imóvel nas visitas.");
  for (const row of included) {
    const errors = row.status===3?laboratoryErrors(row.b):{};
    if (Object.keys(errors).length)
      issues.push(
        "Revise o resultado laboratorial na visita " +
          row.values.rua +
          ": " +
          Object.values(errors)[0],
      );
  }
  return issues;
}
export const planningLocalityCompleted = (rows: any[]) => {
 const active=rows.filter(row=>Number(val(row.visita||row,"SITUACAO",1))!==0);
 return active.length>0 && active.every(row=>Number(val(row.visita||row,"SITUACAO_REFERENCIA",row.situacaoVisita))===3);
};
export async function createDailyReport(
  plan: any,
  rows: any[],
  catalog: any,
  options: any = {},
) {
  const issues = reportIssues(plan, rows, catalog, options);
  if (issues.length) throw new Error(issues.join("\n"));
  const b = {
    ...reportMetadata(plan.boletimJson ?? plan.BOLETIM_JSON ?? plan.boletim),
    ...options,
    supervisorNome: reportMetadata(plan.boletimJson ?? plan.BOLETIM_JSON ?? plan.boletim).supervisorNome || "",
    concluida: planningLocalityCompleted(rows),
  };
  const municipality = catalog.municipios.find(
    (m: any) =>
      m.value === Number(b.municipioIbge || plan.idCidade || plan.ID_CIDADE),
  );
  const entries = rows
    .map(normalizeReportVisit)
    .filter(
      (r: any) =>
        r.date &&
        [1, 2, 3].includes(r.status) &&
        (!b.data || r.date === b.data),
    );
  const groups = new Map<string, any[]>();
  for (const r of entries) {
    const key =
      r.date +
      "|" +
      (r.agent || b.agenteNome) +
      "|" +
      (r.agentCode || b.agenteCodigo || "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const pdf = await PDFDocument.create();
  pdf.setTitle(
    "Registro diário do serviço antivetorial - " + municipality.nome,
  );
  pdf.setAuthor("Inteliagent");
  const font = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 841.89,
    H = 595.28,
    M = 16,
    usable = W - 2 * M,
    scale = usable / reportColumns.reduce((n, c) => n + Number(c[2]), 0);
  const boxes: any[] = [];
  const overflow: any[] = [];
  let pageNumber = 0;
  function createPage() {
    pageNumber++;
    return pdf.addPage([W, H]);
  }
  function cell(
    page: any,
    value: any,
    x: number,
    top: number,
    w: number,
    h: number,
    size = 6.3,
    align = "center",
    strong = false,
    reference = "",
  ) {
    const f = strong ? bold : font,
      s = text(value);
    if (!s) return;
    let fs = size;
    while (fs > 5 && f.widthOfTextAtSize(s, fs) > w - 4) fs -= 0.2;
    let lines: string[] = [];
    let line = "";
    for (const word of s.split(" ")) {
      if (f.widthOfTextAtSize((line ? line + " " : "") + word, fs) <= w - 4)
        line += (line ? " " : "") + word;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    const maxLines = Math.max(1, Math.floor((h - 3) / (fs + 1)));
    if (
      lines.length > maxLines ||
      lines.some((l) => f.widthOfTextAtSize(l, fs) > w - 4)
    ) {
      const mark = "[" + (overflow.length + 1) + "]";
      overflow.push({ reference, value: s });
      lines = [
        ...lines
          .filter((l) => f.widthOfTextAtSize(l, fs) <= w - 4)
          .slice(0, Math.max(0, maxLines - 1)),
        mark,
      ];
    }
    lines.forEach((l, i) => {
      const tx =
        align === "left" ? x + 2 : x + (w - f.widthOfTextAtSize(l, fs)) / 2;
      const y = H - top - (h - lines.length * (fs + 1)) / 2 - fs - i * (fs + 1);
      page.drawText(l, { x: tx, y, size: fs, font: f, color: rgb(0, 0, 0) });
      boxes.push({
        page: pageNumber,
        x: tx,
        y,
        width: f.widthOfTextAtSize(l, fs),
        height: fs,
        cell: { x, top, w, h },
        text: l,
      });
    });
  }
  function rect(
    page: any,
    x: number,
    top: number,
    w: number,
    h: number,
    shade = 1,
  ) {
    page.drawRectangle({
      x,
      y: H - top - h,
      width: w,
      height: h,
      borderWidth: 0.4,
      borderColor: rgb(0.35, 0.35, 0.35),
      color: rgb(shade, shade, shade),
    });
  }
  function field(
    page: any,
    label: string,
    value: any,
    x: number,
    top: number,
    w: number,
  ) {
    rect(page, x, top, w, 23);
    cell(page, label, x + 2, top + 1, w - 4, 8, 5.4, "left");
    cell(page, value, x + 2, top + 9, w - 4, 13, 7, "left", true);
  }
  function renderBack(chunk: any[], frontNumber: number) {
    const page = createPage(),
      summary = summarizeReportRows(chunk),
      first = chunk[0];
    cell(
      page,
      "RESUMO DIÁRIO DO TRABALHO DE CAMPO",
      M,
      14,
      usable,
      18,
      11,
      "center",
      true,
    );
    cell(
      page,
      municipality.nome +
        " / " +
        municipality.uf +
        " · " +
        br(first.date) +
        " · " +
        (first.agent || b.agenteNome) +
        " · Verso da frente " +
        frontNumber,
      M,
      34,
      usable,
      15,
      8,
      "center",
    );
    const band = (title: string, top: number) => {
      rect(page, M, top, usable, 17, 0.9);
      cell(page, title, M, top, usable, 17, 8, "center", true);
    };
    const table = (
      title: string,
      headers: string[],
      values: any[],
      x: number,
      top: number,
      width: number,
    ) => {
      rect(page, x, top, width, 16, 0.93);
      cell(page, title, x, top, width, 16, 7, "center", true);
      const cw = width / headers.length;
      headers.forEach((label, i) => {
        rect(page, x + i * cw, top + 16, cw, 30, 0.96);
        cell(page, label, x + i * cw, top + 16, cw, 30, 6.5);
        rect(page, x + i * cw, top + 46, cw, 22);
        cell(
          page,
          values[i] ?? "",
          x + i * cw,
          top + 46,
          cw,
          22,
          8,
          "center",
          true,
        );
      });
    };
    table(
      "Imóveis trabalhados por tipo",
      ["Residência", "Comércio", "TB", "PE", "Outros", "Total"],
      [...summary.properties, summary.worked],
      M,
      59,
      260,
    );
    table(
      "Número de imóveis",
      ["Trat. focal", "Trat. perifocal", "Inspecionados", "Recuperados"],
      [summary.focal, summary.perifocal, summary.inspected, summary.recovered],
      M + 270,
      59,
      250,
    );
    table(
      "Coleta / pendências",
      ["Tubitos", "Fechados", "Recusados", "Informados"],
      [summary.tubes, summary.closed, summary.refused, summary.informed],
      M + 530,
      59,
      usable - 530,
    );
    table(
      "Depósitos inspecionados por tipo",
      [...depositTypes, "Total"],
      [...summary.deposits, summary.deposits.reduce((a, c) => a + c, 0)],
      M,
      137,
      365,
    );
    table(
      "Depósitos eliminados",
      ["Quantidade"],
      [summary.eliminated],
      M + 375,
      137,
      85,
    );
    table(
      "Depósitos tratados · larvicida (L1 e L2)",
      ["Produto", "Gramas", "Depósitos"],
      [
        summary.focalProducts.map((p) => p.tipo).join(" / "),
        summary.focalProducts.map((p) => p.gramas).join(" / "),
        summary.focalProducts.map((p) => p.depositos).join(" / "),
      ],
      M + 470,
      137,
      190,
    );
    table(
      "Adulticida",
      ["Tipo", "Cargas"],
      [
        summary.adulticides.map((p) => p.tipo).join(" / "),
        summary.adulticides.map((p) => p.cargas).join(" / "),
      ],
      M + 670,
      137,
      usable - 670,
    );
    field(
      page,
      "Nº dos quarteirões trabalhados",
      summary.quarters.join(" · "),
      M,
      215,
      usable / 2 - 5,
    );
    field(
      page,
      "Nº dos quarteirões concluídos",
      summary.completedQuarters.join(" · "),
      M + usable / 2 + 5,
      215,
      usable / 2 - 5,
    );
    band("RESUMO DO LABORATÓRIO", 250);
    cell(
      page,
      summary.labCount
        ? summary.labCount +
            " visita(s) com resultado concluído. Totais abaixo consideram apenas esses resultados."
        : "Sem resultado laboratorial concluído cadastrado. Os campos de resultado permanecem em branco.",
      M,
      269,
      usable,
      16,
      7,
      "left",
    );
    const aeg = summary.species[0],
      alb = summary.species[1];
    field(
      page,
      "Nº dos quarteirões com Aedes aegypti",
      aeg.quarters.join(" · "),
      M,
      289,
      usable / 2 - 5,
    );
    field(
      page,
      "Nº dos quarteirões com Aedes albopictus",
      alb.quarters.join(" · "),
      M + usable / 2 + 5,
      289,
      usable / 2 - 5,
    );
    // Three separate species rows avoid conflating positive containers and specimen counts.
    const matrix = (
      title: string,
      headers: string[],
      values: any[][],
      x: number,
      top: number,
      width: number,
    ) => {
      rect(page, x, top, width, 17, 0.93);
      cell(page, title, x, top, width, 17, 7, "center", true);
      const labelWidth = 74,
        cw = (width - labelWidth) / headers.length;
      rect(page, x, top + 17, labelWidth, 27, 0.96);
      cell(page, "Espécie", x, top + 17, labelWidth, 27, 6.5);
      headers.forEach((label, i) => {
        rect(page, x + labelWidth + i * cw, top + 17, cw, 27, 0.96);
        cell(page, label, x + labelWidth + i * cw, top + 17, cw, 27, 6);
      });
      summary.species.forEach((species, row) => {
        const y = top + 44 + row * 24;
        rect(page, x, y, labelWidth, 24);
        cell(page, species.label, x, y, labelWidth, 24, 6.3);
        headers.forEach((_, i) => {
          rect(page, x + labelWidth + i * cw, y, cw, 24);
          cell(
            page,
            summary.labCount ? values[row][i] : "",
            x + labelWidth + i * cw,
            y,
            cw,
            24,
            7,
          );
        });
      });
    };
    matrix(
      "Depósitos com espécimes por tipo",
      [...depositTypes, "Total"],
      summary.species.map((s) => [
        ...s.deposits,
        s.deposits.reduce((a, c) => a + c, 0),
      ]),
      M,
      324,
      330,
    );
    matrix(
      "Imóveis com espécimes por tipo",
      ["Res.", "Com.", "TB", "PE", "Outros", "Total"],
      summary.species.map((s) => [
        ...s.properties,
        s.properties.reduce((a, c) => a + c, 0),
      ]),
      M + 340,
      324,
      275,
    );
    matrix(
      "Número de exemplares",
      ["Larvas", "Pupas", "Exúvias", "Adultos"],
      summary.species.map((s) => s.specimens),
      M + 625,
      324,
      usable - 625,
    );
    field(
      page,
      "Data de entrada",
      summary.entryDates.map((d) => br(String(d))).join(" · "),
      M,
      453,
      120,
    );
    field(
      page,
      "Data de conclusão",
      summary.completionDates.map((d) => br(String(d))).join(" · "),
      M + 130,
      453,
      120,
    );
    field(
      page,
      "Laboratório",
      summary.labs.join(" · "),
      M + 260,
      453,
      usable - 260,
    );
    field(
      page,
      "Laboratorista",
      summary.technicians.join(" · "),
      M,
      488,
      usable / 2 - 5,
    );
    field(
      page,
      "Assinatura do laboratorista (manual)",
      "",
      M + usable / 2 + 5,
      488,
      usable / 2 - 5,
    );
    field(page, "Agente", first.agent || b.agenteNome, M, 523, usable / 2 - 5);
    field(
      page,
      "Supervisor",
      b.supervisorNome || "",
      M + usable / 2 + 5,
      523,
      usable / 2 - 5,
    );
    cell(
      page,
      "Resumo dos " +
        summary.total +
        " registros da frente " +
        frontNumber +
        ". Quarteirões concluídos e imóveis informados dependem da marcação no cadastro da visita.",
      M,
      552,
      usable,
      14,
      6,
      "left",
    );
    cell(
      page,
      "Inteliagent · Município IBGE " +
        municipality.value +
        " · Verso · Página " +
        pageNumber,
      M,
      577,
      usable,
      10,
      5.5,
      "left",
    );
  }
  for (const group of groups.values())
    for (let offset = 0; offset < group.length; offset += 20) {
      const page = createPage(),
        chunk = group.slice(offset, offset + 20),
        first = chunk[0];
      cell(
        page,
        "SECRETARIA MUNICIPAL DE SAÚDE",
        M,
        12,
        190,
        12,
        7,
        "left",
        true,
      );
      cell(
        page,
        municipality.nome + " / " + municipality.uf,
        M,
        25,
        190,
        12,
        8,
        "left",
        true,
      );
      cell(
        page,
        "PROGRAMA NACIONAL DE CONTROLE DA DENGUE - PNCD",
        M + 190,
        12,
        usable - 190,
        12,
        10,
        "center",
        true,
      );
      cell(
        page,
        "REGISTRO DIÁRIO DO SERVIÇO ANTIVETORIAL",
        M + 190,
        27,
        usable - 190,
        12,
        10,
        "center",
        true,
      );
      field(
        page,
        "Município / UF",
        municipality.nome + " / " + municipality.uf,
        M,
        45,
        175,
      );
      field(
        page,
        "Código e nome da localidade",
        b.codigoLocalidade + " · " + (plan.nome || plan.descricao || plan.NOME),
        M + 175,
        45,
        330,
      );
      field(
        page,
        "Categoria",
        b.categoriaLocalidade ||
          catalog.categorias.find(
            (c: any) =>
              c.value === Number(plan.idCategoria || plan.ID_CATEGORIA),
          )?.code,
        M + 505,
        45,
        100,
      );
      field(page, "Zona", plan.zona || plan.ZONA, M + 605, 45, usable - 605);
      field(page, "Data da atividade", br(first.date), M, 72, 100);
      field(
        page,
        "Ciclo / ano",
        String(plan.ciclo ?? plan.CICLO ?? b.ciclo) +
          " / " +
          String(plan.ano || plan.ANO || first.date).slice(0, 4),
        M + 100,
        72,
        100,
      );
      field(
        page,
        "Atividade PNCD",
        catalog.atividades.find(
          (r: any) =>
            r.value === Number(b.atividade || plan.atividade || plan.ATIVIDADE),
        )?.label,
        M + 200,
        72,
        310,
      );
      field(
        page,
        "Tipo localidade",
        Number(b.tipoLocalidade || plan.tipo || plan.TIPO) === 1
          ? "1 · Sede"
          : "2 · Outros",
        M + 510,
        72,
        130,
      );
      field(
        page,
        "Concluída?",
        (b.concluida ?? Number(plan.STATUS ?? plan.situacao) === 1)
          ? "Sim"
          : "Não",
        M + 640,
        72,
        usable - 640,
      );
      rect(page, M, 104, usable, 12, 0.9);
      cell(
        page,
        "PESQUISA ENTOMOLÓGICA / TRATAMENTO",
        M,
        104,
        usable,
        12,
        7,
        "center",
        true,
      );
      let x = M;
      const starts: number[] = [];
      for (const c of reportColumns) {
        starts.push(x);
        x += Number(c[2]) * scale;
      }
      const span = (a: number, z: number, label: string) => {
        const x = starts[a],
          w = reportColumns
            .slice(a, z)
            .reduce((n, c) => n + Number(c[2]) * scale, 0);
        rect(page, x, 116, w, 14, 0.94);
        cell(page, label, x, 116, w, 14, 6, "center", true);
      };
      span(0, 11, "Identificação do imóvel");
      span(11, 18, "Depósitos inspecionados");
      span(18, 19, "LI");
      span(19, 22, "Coleta");
      span(22, 24, "Controle");
      span(24, 30, "Tratamento focal");
      span(30, 32, "Perifocal");
      reportColumns.forEach((c, i) => {
        const width = Number(c[2]) * scale;
        rect(page, starts[i], 130, width, 54, 0.94);
        if (["rua", "complemento"].includes(c[0]))
          cell(page, c[1], starts[i], 130, width, 54, 6.5);
        else {
          const label = text(c[1]);
          const fs = Math.min(5.3, 48 / font.widthOfTextAtSize(label, 1));
          page.drawText(label, {
            x: starts[i] + width / 2 + 2,
            y: H - 130 - 50,
            size: fs,
            font,
            rotate: degrees(90),
          });
        }
      });
      for (let i = 0; i < 20; i++)
        reportColumns.forEach((c, j) => {
          const w = Number(c[2]) * scale,
            top = 184 + i * 17;
          rect(page, starts[j], top, w, 17);
          if (chunk[i])
            cell(
              page,
              chunk[i].values[c[0]],
              starts[j],
              top,
              w,
              17,
              6.3,
              ["rua", "complemento"].includes(c[0]) ? "left" : "center",
              false,
              br(first.date) + " · " + chunk[i].values.rua + " · " + c[1],
            );
        });
      reportColumns.forEach((c, j) => {
        const w = Number(c[2]) * scale;
        rect(page, starts[j], 524, w, 17, 0.93);
        const sumKeys = [
          "d1",
          "d2",
          "d3",
          "d4",
          "d5",
          "d6",
          "d7",
          "tubos",
          "eliminados",
          "f1gramas",
          "f1dep",
          "f2gramas",
          "f2dep",
          "pericarga",
        ];
        const value =
          c[0] === "rua"
            ? "TOTAIS DESTA FOLHA"
            : sumKeys.includes(c[0])
              ? chunk.reduce((n: any, r: any) => n + num(r.values[c[0]]), 0)
              : ["li", "imTrat"].includes(c[0])
                ? chunk.filter((r: any) => r.values[c[0]] === "X").length
                : "";
        cell(page, value, starts[j], 524, w, 17, 6, "center", true);
      });
      cell(
        page,
        "Imóvel: R residência · C comércio · TB terreno baldio · PE ponto estratégico · O outros | Visita: N normal · R recuperação | Pendência: F fechado · R recusado",
        M,
        543,
        usable,
        12,
        6,
        "left",
      );
      field(
        page,
        "Agente (identificação; assinatura manual)",
        (first.agent || b.agenteNome) +
          (first.agentCode || b.agenteCodigo
            ? " · " + (first.agentCode || b.agenteCodigo)
            : ""),
        M,
        558,
        usable / 2,
      );
      field(
        page,
        "Supervisor (identificação; assinatura manual)",
        b.supervisorNome || "",
        M + usable / 2,
        558,
        usable / 2,
      );
      cell(
        page,
        "Inteliagent · Município IBGE " +
          municipality.value +
          " · Folha " +
          pageNumber,
        M,
        583,
        usable,
        9,
        5.4,
        "left",
      );
      renderBack(chunk, pageNumber);
    }
  if (overflow.length) {
    let page: any,
      top = 0;
    const supplementPage = () => {
      page = createPage();
      top = 48;
      cell(
        page,
        "COMPLEMENTO DO REGISTRO DIÁRIO - textos completos",
        M,
        16,
        usable,
        20,
        11,
        "left",
        true,
      );
    };
    supplementPage();
    // Split even uninterrupted identifiers; supplementary text never re-enters the overflow queue.
    for (let i = 0; i < overflow.length; i++) {
      const item = overflow[i],
        full = text("[" + (i + 1) + "] " + item.reference + ": " + item.value);
      let line = "";
      const lines: string[] = [];
      for (const character of full) {
        if (font.widthOfTextAtSize(line + character, 7) > usable - 12) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
      if (line) lines.push(line);
      for (const line of lines) {
        if (top + 14 > H - 20) supplementPage();
        rect(page, M, top, usable, 14);
        cell(page, line, M + 3, top, usable - 6, 14, 7, "left");
        top += 14;
      }
      top += 4;
    }
  }

  const bytes = await pdf.save();
  return {
    bytes,
    base64: await pdf.saveAsBase64(),
    pages: pdf.getPageCount(),
    boxes,
    filename:
      "PNCD-" +
      municipality.uf +
      "-" +
      municipality.value +
      "-" +
      (b.data || "periodo") +
      ".pdf",
  };
}
