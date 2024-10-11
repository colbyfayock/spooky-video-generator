import Container from "@/components/Container";
import Link from "next/link";

const Header = () => {
  return (
    <header className="mt-8 mb-12">
      <Container>
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="font-bold">
              <Link href="/dashboard">Spooky Video Generator</Link>
            </p>
          </div>
          <div>
            asdf
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
