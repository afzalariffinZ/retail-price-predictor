export function Footer() {
  return (
    <footer className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
      <p>
        Developed by: Afzal Ariffin | LinkedIn:{" "}
        <a 
          href="https://www.linkedin.com/in/afzal-ariffin-764bb9277/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary underline"
        >
          afzal-ariffin-764bb9277
        </a>
        {" "}| Email:{" "}
        <a 
          href="mailto:afzal.ariffin04@gmail.com"
          className="hover:text-primary underline"
        >
          afzal.ariffin04@gmail.com
        </a>
      </p>
    </footer>
  )
}
