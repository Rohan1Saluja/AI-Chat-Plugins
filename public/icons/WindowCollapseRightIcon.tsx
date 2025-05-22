interface Props {
  className?: string;
  onClick?: any;
  title?: string;
}

const WindowCollapseRightIcon: React.FC<Props> = ({
  className,
  onClick,
  title,
}) => {
  return (
    <svg
      className={`hover:cursor-pointer group ${className}`}
      onClick={onClick}
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 15.5V5.5C3.5 4.96957 3.71071 4.46086 4.08579 4.08579C4.46086 3.71071 4.96957 3.5 5.5 3.5H15.5C16.0304 3.5 16.5391 3.71071 16.9142 4.08579C17.2893 4.46086 17.5 4.96957 17.5 5.5V15.5C17.5 16.0304 17.2893 16.5391 16.9142 16.9142C16.5391 17.2893 16.0304 17.5 15.5 17.5H5.5C4.96957 17.5 4.46086 17.2893 4.08579 16.9142C3.71071 16.5391 3.5 16.0304 3.5 15.5Z"
        className="stroke-text-400 group-hover:stroke-text-500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5 15.5V5.5C15.5 4.96957 15.2893 4.46086 14.9142 4.08579C14.5391 3.71071 14.0304 3.5 13.5 3.5H15.5C16.5 3.5 17.5 4.395 17.5 5.5V15.5C17.5 16.605 16.5 17.5 15.5 17.5H13.5C14.0304 17.5 14.5391 17.2893 14.9142 16.9142C15.2893 16.5391 15.5 16.0304 15.5 15.5Z"
        className="fill-text-400 stroke-text-400 group-hover:stroke-text-500 group-hover:fill-text-500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 13.5L13.5 10.5M13.5 10.5L10.5 7.5M13.5 10.5H5.5"
        className="stroke-text-400 group-hover:stroke-text-500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WindowCollapseRightIcon;
