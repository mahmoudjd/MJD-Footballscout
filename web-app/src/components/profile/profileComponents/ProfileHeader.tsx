interface Props {
  position: string;
  name: string;
  title: string;
  image: string;
  number: number;
}

const setHeaderClass = (position: string) => {
  return position.includes("Forward")
    ? "forward"
    : position.includes("Midfielder")
      ? "midfielder"
      : position.includes("Defender")
        ? "defender"
        : "goal";
};

const ProfileHeader = ({ name, title, position, image, number }: Props) => {
  return (
    <header className={`header-profile ${setHeaderClass(position)}`}>
      <div className="player-image">
        <div className="image-frame">
          <img src={image} alt={name} />
        </div>
      </div>
      <h2 className="title-profile">
        {number ?? "-"}. {title ? decodeURIComponent(title): name}
      </h2>
    </header>
  );
};

export default ProfileHeader;
