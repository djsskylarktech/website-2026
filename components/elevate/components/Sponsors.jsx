import { FLEET } from "../config";

export default function Sponsors() {
  return (
    <div className="sponsors__list">
      <div className="sponsors__row">
        {FLEET.map((aircraft) => (
          <a key={aircraft.name} className="sponsors__card sponsors__card--aircraft" href={aircraft.url} aria-label={`Explore ${aircraft.name}`}>
            <span className="sponsors__role">{aircraft.role}</span>
            <span className="sponsors__name">{aircraft.name}</span>
            <span className="sponsors__detail">{aircraft.detail}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
