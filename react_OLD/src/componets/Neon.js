export default function ProjectList(props) {
  let text;
  props.children.forEach(function (x) {
    text = (
      <>
        {text}
        {x}
      </>
    );
  });
  text = (<div className='neonBox'>{text}</div>)
  return (
    <>
      <div id="pBody">
        <div className="fPage">
          <div className="heightBox">{text}</div>
        </div>
      </div>
    </>
  );
}
