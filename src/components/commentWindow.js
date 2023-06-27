const CommentWindow = ({ comment }) => {
    const [expanded, setExpanded] = useState(false);
  
    const toggleExpand = () => {
      setExpanded(!expanded);
    };
  
    return (
      <div className={`comment-window ${expanded ? 'expanded' : ''}`} onClick={toggleExpand}>
        {comment}
      </div>
    );
  };
  