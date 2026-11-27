import { Icon, Stars } from "../icons";
import { ANONYMOUS_NAME, getFeaturedReviews, getReviewStats, type ReviewStats } from "@/lib/reviews";

async function loadStats(): Promise<ReviewStats | null> {
  try {
    return await getReviewStats();
  } catch (error) {
    console.error("Review stats unavailable", error);
    return null;
  }
}

const plural = (n: number) => `${n} rating${n === 1 ? "" : "s"}`;

/** Average + distribution of every Google Form rating. */
export async function RatingSummary() {
  const stats = await loadStats();
  if (!stats) return null;
  if (stats.count === 0) {
    return (
      <div className="rv-score rv-score--empty">
        <Icon name="star" size={26} filled />
        <p><strong>No ratings yet.</strong> Be the first to rate DOLCE — your review could appear right here.</p>
      </div>
    );
  }
  return (
    <div className="rv-score">
      <div className="rv-score-num">
        <strong>{stats.average.toFixed(1)}</strong>
        <Stars rating={stats.average} size={18} />
        <span>{plural(stats.count)}</span>
      </div>
      <ul aria-label="Rating breakdown">
        {stats.distribution.map(({ stars, count }) => (
          <li key={stars}>
            <span>{stars}★</span>
            <span className="lp-bar"><span style={{ width: `${(count / stats.count) * 100}%` }} /></span>
            <span>{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Reviews the admin featured (only ones customers allowed us to show). */
export async function FeaturedReviews() {
  let featured: Awaited<ReturnType<typeof getFeaturedReviews>> = [];
  try {
    featured = await getFeaturedReviews(9);
  } catch (error) {
    console.error("Featured reviews unavailable", error);
    return null;
  }
  if (featured.length === 0) return null;
  return (
    <div className="lp-review-grid">
      {featured.map((r, i) => {
        const anonymous = r.name === ANONYMOUS_NAME;
        return (
          <article key={r.id} className="lp-review reveal" style={{ "--d": `${(i % 3) * 100}ms` } as React.CSSProperties}>
            <Icon name="quote" size={26} className="lp-review-quote" />
            <Stars rating={r.rating} />
            <p>{r.text}</p>
            <footer>
              <span className="lp-avatar" aria-hidden="true">{anonymous ? <Icon name="heart" size={18} /> : r.name.slice(0, 1).toUpperCase()}</span>
              <span>
                <strong>{r.name}</strong>
                <small>{[r.product, new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })].filter(Boolean).join(" · ")}</small>
              </span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

/** Hero stat "4.8★ customer love" — hidden until there are ratings. */
export async function HeroRatingFact() {
  const stats = await loadStats();
  if (!stats?.count) return null;
  return <li><strong>{stats.average.toFixed(1)}★</strong><span>customer <br />love</span></li>;
}

/** Floating hero card "★★★★★ 4.8 / 5 from N ratings" — hidden until there are ratings. */
export async function HeroRatingCard() {
  const stats = await loadStats();
  if (!stats?.count) return null;
  return (
    <div className="lp-hero-card lp-hero-card--rating">
      <Stars rating={stats.average} size={14} />
      <strong>{stats.average.toFixed(1)} / 5</strong>
      <span>from {plural(stats.count)}</span>
    </div>
  );
}
