export function RatingStars({ rating }) {
  const full = Math.round(rating || 0);
  return <span className="sn-stars">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>;
}
