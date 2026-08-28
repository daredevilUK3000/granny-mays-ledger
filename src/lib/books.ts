/**
 * Granny's Bookcase — book data. Add new titles by appending to BOOKS
 * below, following the shape of the existing entries. Cover art is
 * portrait-orientation, in /public/books/.
 */

/** Amazon Associates tracking ID (the bit after "tag=" in any link
 *  generated from the Associates dashboard). */
const AMAZON_AFFILIATE_TAG = "tss046-21";

export interface Book {
  id: string;
  title: string;
  /** shown under the title in the detail view, e.g. "Kizzi Nkwocha" */
  author: string;
  /** path to cover art, e.g. "/books/everyday-investor.jpg" */
  coverImage: string;
  /** 2-4 sentence summary shown when the book is clicked */
  summary: string;
  /** Amazon product URL WITHOUT the affiliate tag — appended automatically
   *  by withAmazonTag() below, so the tag only needs to live in one place. */
  amazonUrl: string;
  /** Barnes & Noble product URL. Plain link for now — swap for an
   *  affiliate-tagged URL once that account is set up; nothing else in
   *  the component needs to change when you do. */
  bnUrl?: string;
}

/** Appends the Amazon Associates tag to a product URL, whether or not
 *  the URL already has query params. Works for full amazon.com/.co.uk
 *  product URLs as well as Amazon's a.co / amzn.eu short links, which
 *  forward query params through to the destination page. */
export function withAmazonTag(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tag=${AMAZON_AFFILIATE_TAG}`;
}

export const BOOKS: Book[] = [
  {
    id: "money-matters-kids",
    title: "Money Matters: A Financial Literacy Adventure for Kids",
    author: "Kizzi Nkwocha",
    coverImage: "/books/money-matters-kids.jpg",
    summary:
      "An illustrated guide for kids around age 10, covering saving, budgeting, earning, credit and debt, and investing — kept fun and light, in language that's easy for kids (and the adults reading along) to follow.",
    amazonUrl: "https://a.co/d/0dtm3wG2",
  },
  {
    id: "online-trading",
    title: "Money Matters: Kizzi's Guide to Online Trading for Beginners",
    author: "Kizzi Nkwocha",
    coverImage: "/books/online-trading.jpg",
    summary:
      "An accessible introduction to online trading for people who've never invested before — from understanding the basics to developing a first trading strategy, drawn from years of hands-on experience in the finance industry.",
    amazonUrl: "https://a.co/d/07irVuQE",
  },
  {
    id: "12-steps-millionaire",
    title: "Money Matters: 12 Steps to Becoming a Millionaire",
    author: "Kizzi Nkwocha",
    coverImage: "/books/12-steps-millionaire.jpg",
    summary:
      "A practical roadmap for thinking like a millionaire — setting achievable goals, building a financial plan, and investing wisely — plus the habits of successful millionaires and how to adopt them, broken into twelve clear steps.",
    amazonUrl: "https://a.co/d/02kURK06",
  },
  {
    id: "money-matters-adults",
    title: "Money Matters: A Financial Literacy Adventure for Adults",
    author: "Kizzi Nkwocha",
    coverImage: "/books/money-matters-adults.jpg",
    summary:
      "A conversational walk through the basics of personal finance for adults — budgeting, saving, passive income, and retirement planning — written with simple language and a healthy dose of humour.",
    amazonUrl: "https://a.co/d/0fwnT596",
  },
  {
    id: "nine-steps-retirement",
    title: "Money Matters: Nine Steps to a Very Successful Retirement",
    author: "Kizzi Nkwocha",
    coverImage: "/books/nine-steps-retirement.jpg",
    summary:
      "A friendly, step-by-step roadmap through the nine essentials of retirement planning, breaking complex financial concepts into plain language for anyone — professional or not — who wants to make the most of their retirement years.",
    amazonUrl: "https://a.co/d/00lxTcrw",
  },
  {
    id: "quantitative-finance",
    title: "Kizzi Talks About Quantitative Finance",
    author: "Kizzi Nkwocha",
    coverImage: "/books/quantitative-finance.jpg",
    summary:
      "An accessible tour of quantitative finance — risk and portfolio management, asset pricing models, and trading strategy — told through real-world examples and stories from years of industry experience.",
    amazonUrl: "https://a.co/d/0iH6yJ7j",
  },
  {
    id: "science-of-getting-rich",
    title: "The Science of Getting Rich",
    author: "Wallace D. Wattles, with an introduction by Kizzi Nkwocha",
    coverImage: "/books/science-of-getting-rich.jpg",
    summary:
      "A classic early-1900s text on the mindset behind building wealth — the \"Certain Way of Thinking\" that grew out of the mental-healing movement — reissued here with a new introduction by Business Game Changer Magazine publisher Kizzi Nkwocha.",
    amazonUrl: "https://amzn.eu/d/075rqCsU",
  },
  {
    id: "art-of-money-getting",
    title: "The Art of Money Getting: Or Golden Rules for Making Money",
    author: "P.T. Barnum, with a foreword by Kizzi Nkwocha",
    coverImage: "/books/art-of-money-getting.jpg",
    summary:
      "A large-text edition of P.T. Barnum's timeless guide to choosing a career, starting a business, and building a fortune — illustrated, with a foreword by Kizzi Nkwocha, and as relevant today as when it was first published over a century ago.",
    amazonUrl: "https://a.co/d/03r7Toej",
  },
  {
    id: "deepak-real-estate-finance",
    title: "Deepak's Little Book of Real Estate Finance and Investment",
    author: "Deepak Singh",
    coverImage: "/books/deepak-real-estate-finance.jpg",
    summary:
      "A comprehensive guide that demystifies real estate investment and finance for newcomers and experienced professionals alike — covering property valuation, financing options, portfolio management, and the strategies that drive successful investments.",
    amazonUrl: "https://a.co/d/0cFR76Jl",
  },
  {
    id: "ai-driven-real-estate",
    title:
      "AI-Driven Real Estate Investment: Predictive Analytics for Outperforming the Market — Book 1: Laying the Foundations for Smarter Property Investment",
    author: "Kizzi Nkwocha",
    coverImage: "/books/ai-driven-real-estate.jpg",
    summary:
      "The first book in a three-part series on how AI, machine learning, and big data are transforming real estate investing — covering data fundamentals, AI-driven valuation models, and how to use predictive analytics to spot opportunities early.",
    amazonUrl: "https://a.co/d/05eEjA6T",
  },
  {
    id: "property-investment-without-bs",
    title: "Property Investment Without the B.S.: What the Non-Pros Need to Know",
    author: "Kizzi Nkwocha",
    coverImage: "/books/property-investment-without-bs.jpg",
    summary:
      "A no-nonsense guide to the basics of property investment — types of properties, investment strategies, market trends, and managing risk — in simple, easy-to-understand language. No B.S., guaranteed.",
    amazonUrl: "https://a.co/d/073Elrd7",
  },
];

/** Splits the book list into shelves of `perShelf` books each (default 4),
 *  so the component can just render one row per shelf. Extra books beyond
 *  4 shelves' worth simply start a fifth shelf — nothing breaks, the
 *  bookcase just grows. */
export function toShelves(books: Book[], perShelf = 4): Book[][] {
  const shelves: Book[][] = [];
  for (let i = 0; i < books.length; i += perShelf) {
    shelves.push(books.slice(i, i + perShelf));
  }
  return shelves;
}
