/**
 * Cliente para PubMed Central API
 * Documentación: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
 */

const EUTILS_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const PMC_BASE_URL = "https://pmc.ncbi.nlm.nih.gov/api";

export interface PubMedArticle {
  pmid: string;
  pmcid?: string;
  doi?: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal: string;
  pubDate: string;
  meshTerms: string[];
  fullTextUrl?: string;
  isOpenAccess: boolean;
  categories: string[];
}

export interface PubMedSearchParams {
  term: string;
  maxResults?: number;
  startDate?: string;
  endDate?: string;
  sort?: "relevance" | "pub_date";
}

export interface PubMedSearchResult {
  articles: PubMedArticle[];
  totalCount: number;
  esearchQuery: string;
}

async function fetchWithTimeout(url: string, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function searchPubMed(params: PubMedSearchParams): Promise<PubMedSearchResult> {
  const { term, maxResults = 20, startDate, endDate, sort = "relevance" } = params;
  
  let query = term;
  if (startDate || endDate) {
    const dateRange: string[] = [];
    if (startDate) dateRange.push(`${startDate}[PDAT]`);
    if (endDate) dateRange.push(`${endDate}[PDAT]`);
    query += ` AND (${dateRange.join(":")})`;
  }

  const esearchUrl = `${EUTILS_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}&sort=${sort}&usehistory=y`;
  
  const searchResponse = await fetchWithTimeout(esearchUrl);
  const searchData = await searchResponse.json();
  
  if (!searchData.esearchresult?.idlist?.length) {
    return { articles: [], totalCount: 0, esearchQuery: query };
  }

  const ids = searchData.esearchresult.idlist.join(",");
  const summaryUrl = `${EUTILS_BASE_URL}/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
  
  const summaryResponse = await fetchWithTimeout(summaryUrl);
  const summaryData = await summaryResponse.json();

  const articles: PubMedArticle[] = [];
  
  for (const pmid of searchData.esearchresult.idlist) {
    const summary = summaryData.result?.[pmid];
    if (!summary) continue;

    const authors = summary.authors?.map((a: { name: string }) => a.name) || [];
    
    articles.push({
      pmid,
      pmcid: summary.pmcid,
      doi: summary.elocationid?.replace("doi: ", ""),
      title: summary.title || "",
      abstract: summary.pubdate,
      authors,
      journal: summary.source || "",
      pubDate: summary.pubdate || "",
      meshTerms: summary.meshheadings?.map((m: { heading: string }) => m.heading) || [],
      isOpenAccess: !!summary.pmcid,
      fullTextUrl: summary.pmcid 
        ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${summary.pmcid}`
        : undefined,
      categories: summary.subset?.map((s: { subset: string }) => s.subset) || [],
    });
  }

  return {
    articles,
    totalCount: parseInt(searchData.esearchresult.count) || 0,
    esearchQuery: query,
  };
}

export async function getArticleDetails(pmid: string): Promise<PubMedArticle | null> {
  const summaryUrl = `${EUTILS_BASE_URL}/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
  
  try {
    const response = await fetchWithTimeout(summaryUrl);
    const data = await response.json();
    const summary = data.result?.[pmid];
    
    if (!summary) return null;

    return {
      pmid,
      pmcid: summary.pmcid,
      doi: summary.elocationid?.replace("doi: ", ""),
      title: summary.title || "",
      abstract: summary.pubdate,
      authors: summary.authors?.map((a: { name: string }) => a.name) || [],
      journal: summary.source || "",
      pubDate: summary.pubdate || "",
      meshTerms: summary.meshheadings?.map((m: { heading: string }) => m.heading) || [],
      isOpenAccess: !!summary.pmcid,
      fullTextUrl: summary.pmcid 
        ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${summary.pmcid}`
        : undefined,
      categories: [],
    };
  } catch (error) {
    console.error("Error fetching article details:", error);
    return null;
  }
}

export async function getOpenAccessArticles(
  maxResults = 50
): Promise<PubMedArticle[]> {
  const searchResult = await searchPubMed({
    term: "open access[filter]",
    maxResults,
    sort: "pub_date",
  });

  return searchResult.articles.filter(a => a.isOpenAccess);
}

export const MEDICAL_SEARCH_TERMS = {
  cardiologia: "cardiovascular disease[MeSH Terms] OR heart disease[Title/Abstract]",
  neurologia: "neurology[MeSH Terms] OR neurological disorder[Title/Abstract]",
  oncologia: "cancer[MeSH Terms] OR oncology[Title/Abstract]",
  endocrinologia: "diabetes[MeSH Terms] OR endocrine[Title/Abstract]",
  gastroenterologia: "gastrointestinal[MeSH Terms] OR digestive disease[Title/Abstract]",
  neumologia: "pulmonology[MeSH Terms] OR respiratory disease[Title/Abstract]",
  nefrologia: "kidney disease[MeSH Terms] OR nephrology[Title/Abstract]",
  reumatologia: "rheumatology[MeSH Terms] OR autoimmune[Title/Abstract]",
  infectologia: "infectious disease[MeSH Terms] OR infection[Title/Abstract]",
  pediatria: "pediatrics[MeSH Terms] OR child health[Title/Abstract]",
  obstetricia: "pregnancy[MeSH Terms] OR obstetrics[Title/Abstract]",
  psiquiatria: "mental health[MeSH Terms] OR depression[Title/Abstract] OR anxiety[Title/Abstract]",
  dermatologia: "dermatology[MeSH Terms] OR skin disease[Title/Abstract]",
  oftalmologia: "ophthalmology[MeSH Terms] OR eye disease[Title/Abstract]",
  otorrinolaringologia: "ENT[Title/Abstract] OR otolaryngology[MeSH Terms]",
  traumatologia: "orthopedics[MeSH Terms] OR trauma[Title/Abstract]",
  urologia: "urology[MeSH Terms] OR urinary tract[Title/Abstract]",
  nutricion: "nutrition[MeSH Terms] OR diet[Title/Abstract]",
  salud_mental: "mental health[MeSH Terms] OR psychology[MeSH Terms]",
  medicina_preventiva: "preventive medicine[MeSH Terms] OR public health[MeSH Terms]",
};
