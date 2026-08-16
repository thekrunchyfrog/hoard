import logo from "../images/dragonLogo.webp";
import { Link } from "react-router-dom";

export function HoardHeader() {
  return (
    <Link to="/">
      <div className="flex flex-row gap-10 bg-black px-6 py-4 rounded-t-xl">
        <img
          src={logo}
          alt="Dragon Logo"
          className="w-50 h-50 object-contain rounded-t-xl mt-5"
        />
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-pixel uppercase tracking-wider font-bold text-retro-red mt-5">
            Hoard
          </h1>
          <h2 className="text-sm font-pixel tracking-wider font-semibold leading-tight text-retro-green mt-5">
            Dragons may not have much real use for all their wealth, but they
            know it to an ounce as a rule, especially after long possession.
          </h2>
          <div className="text-sm font-pixel tracking-wider font-semibold leading-tight text-retro-green ml-auto mt-3">
            - The Hobbit, J.R.R. Tolkien
          </div>
        </div>
      </div>
    </Link>
  );
}
