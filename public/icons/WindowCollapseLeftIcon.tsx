interface Props {
  className?: string;
  onClick?: any;
  title?: string;
}

const WindowCollapseLeftIcon: React.FC<Props> = ({
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
        d="M17.5 15.5V5.5C17.5 4.96957 17.2893 4.46086 16.9142 4.08579C16.5391 3.71071 16.0304 3.5 15.5 3.5H5.5C4.96957 3.5 4.46086 3.71071 4.08579 4.08579C3.71071 4.46086 3.5 4.96957 3.5 5.5V15.5C3.5 16.0304 3.71071 16.5391 4.08579 16.9142C4.46086 17.2893 4.96957 17.5 5.5 17.5H15.5C16.0304 17.5 16.5391 17.2893 16.9142 16.9142C17.2893 16.5391 17.5 16.0304 17.5 15.5Z"
        className="stroke-text-400 group-hover:stroke-text-500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 15.5V5.5C5.5 4.96957 5.71071 4.46086 6.08579 4.08579C6.46086 3.71071 6.96957 3.5 7.5 3.5H5.5C4.5 3.5 3.5 4.395 3.5 5.5V15.5C3.5 16.605 4.5 17.5 5.5 17.5H7.5C6.96957 17.5 6.46086 17.2893 6.08579 16.9142C5.71071 16.5391 5.5 16.0304 5.5 15.5Z"
        className="fill-text-400 stroke-text-400 group-hover:stroke-text-500 group-hover:fill-text-500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 13.5L7.5 10.5M7.5 10.5L10.5 7.5M7.5 10.5H15.5"
        className="stroke-text-400 group-hover:stroke-text-500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WindowCollapseLeftIcon;
