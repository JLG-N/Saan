function mapQuery(spots) {
  const placeName = (spot) => [spot.name, spot.address, "Philippines"].filter(Boolean).join(", ");
  const params = new URLSearchParams();
  params.set("output", "embed");

  if (spots.length === 1) {
    params.set("q", placeName(spots[0]));
  } else {
    params.set("saddr", placeName(spots[0]));
    params.set("daddr", spots.slice(1).map(placeName).join(" to:"));
  }

  return `https://maps.google.com/maps?${params.toString()}`;
}

export function PlanMap({ spots, selectedSpotId, onClearSelection }) {
  if (spots.length === 0) {
    return <div className="sn-plan-map sn-plan-map-empty">Add spots to see them on a map.</div>;
  }

  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);
  const mapSpots = selectedSpot ? [selectedSpot] : spots;

  return (
    <div className="sn-plan-map">
      <iframe
        title={selectedSpot ? `Map showing ${selectedSpot.name}` : `Map route through ${spots.length} plan stops`}
        src={mapQuery(mapSpots)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {selectedSpot && (
        <button className="sn-map-route-reset" type="button" onClick={onClearSelection}>
          Show full route
        </button>
      )}
    </div>
  );
}