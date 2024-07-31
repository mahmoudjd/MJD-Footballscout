interface ItemProps {
  label: string;
  value: string | number;
}

const ProfileInfoItem = ({ label, value }: ItemProps) => {
  return (
    <div className="info-item">
      <strong>{label}</strong> {value}
    </div>
  );
};

export default ProfileInfoItem;
