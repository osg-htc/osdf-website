import { useRouter } from 'next/router';
import Link from 'next/link';


export default function NavLink({ href, exact, children, ...props }) {
  const { pathname } = useRouter();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  if (isActive) {
    props.className += ' active';
  }

  return (
    <>
      <Link href={href} {...props}>
          {children}
      </Link>
      <style jsx>{`
        
        .active {
          border-bottom: 2px solid #fff;
          font-weight: bold;
        }
        `}</style>
    </>
  );
}