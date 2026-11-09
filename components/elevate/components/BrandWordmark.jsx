/** The transparent official mark, with a light variant for dark sections. */
export default function BrandWordmark() {
  return (
    <span className="brand-wordmark" aria-hidden="true">
      <img className="brand-wordmark__dark" src="/brand/djs-skylark-official.png" alt="" />
      <img className="brand-wordmark__light" src="/brand/djs-skylark-official-light.png" alt="" />
    </span>
  );
}
