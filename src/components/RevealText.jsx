export default function RevealText({ text, className, as: Component = 'h2' }) {
  const words = text.split(' ');
  return (
    <Component className={className}>
      {words.map((word, index) => (
        <span 
          key={index} 
          style={{ 
            display: 'inline-block', 
            overflow: 'hidden', 
            verticalAlign: 'bottom',
            paddingRight: index < words.length - 1 ? '0.25em' : '0'
          }}
        >
          <span 
            className="reveal-word block pb-1 font-geist font-light tracking-tighter"
            style={{ animationDelay: `${0.2 + index * 0.04}s` }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
}