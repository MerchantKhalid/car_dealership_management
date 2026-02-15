// import 'next-auth';

// declare module 'next-auth' {
//   interface Session {
//     user: {
//       id: string;
//       email: string;
//       name: string;
//       role: 'OWNER' | 'SALESPERSON' | 'MECHANIC' | 'VIEWER';
//     };
//   }

//   interface User {
//     id: string;
//     email: string;
//     name: string;
//     role: 'OWNER' | 'SALESPERSON' | 'MECHANIC' | 'VIEWER';
//   }
// }

// declare module 'next-auth/jwt' {
//   interface JWT {
//     id: string;
//     role: 'OWNER' | 'SALESPERSON' | 'MECHANIC' | 'VIEWER';
//   }
// }

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'OWNER' | 'SALESPERSON' | 'MECHANIC' | 'VIEWER';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'OWNER' | 'SALESPERSON' | 'MECHANIC' | 'VIEWER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'OWNER' | 'SALESPERSON' | 'MECHANIC' | 'VIEWER';
  }
}
