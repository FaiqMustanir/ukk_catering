import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2D2A26] text-[#EAE5DF]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-bold font-serif text-[#F3E5AB]">Mangan.</h2>
            <p className="mt-4 text-[#C8B6A6] leading-relaxed max-w-md">
              Layanan catering premium dengan cita rasa nusantara yang autentik. 
              Menghadirkan kehangatan dalam setiap hidangan untuk momen spesial Anda.
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D3A36] text-[#C8B6A6] hover:bg-[#F3E5AB] hover:text-[#2D2A26] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D3A36] text-[#C8B6A6] hover:bg-[#F3E5AB] hover:text-[#2D2A26] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white tracking-wide uppercase text-sm">Menu</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/" className="text-[#998F85] hover:text-[#F3E5AB] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-[#998F85] hover:text-[#F3E5AB] transition-colors">
                  Menu Catering
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-[#998F85] hover:text-[#F3E5AB] transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-[#998F85] hover:text-[#F3E5AB] transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white tracking-wide uppercase text-sm">Kontak</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center gap-3 text-[#998F85]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D3A36]">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3 text-[#998F85]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D3A36]">
                  <Mail className="h-4 w-4" />
                </div>
                <span>halo@mangan.id</span>
              </li>
              <li className="flex items-start gap-3 text-[#998F85]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D3A36] flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Jl. Kuliner No. 123, Jakarta</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-[#3D3A36] pt-8">
          <p className="text-center text-[#7D766F] text-sm">
            &copy; {new Date().getFullYear()} Mangan Catering. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
