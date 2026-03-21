const posts = [
  {
    slug: "nepal-vps-showdown-2026",
    title: "Nepal VPS Showdown 2026",
    excerpt: "WorldLink, Subisu, and AWS compared from a practical DevOps view: speed, agility, latency, and cost for teams in Nepal.",
    date: "2026-03-17",
    readTime: "PDF",
    tags: ["VPS", "Nepal", "Benchmark"],
    pdfUrl: "/Nepal_VPS_Showdown_2026_Navin.pdf"
  }
];

function getAllPosts() {
  return posts;
}

function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) || null;
}

module.exports = {
  getAllPosts,
  getPostBySlug
};
