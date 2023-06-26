export type Book = {
  id: string;
  title: string;
  author: string;
  editorial : Editorial
  date : Date,
  reservado : boolean
};

export type Editorial = {
  id : string,
  name : string, 
  year : number,
  books : Book[]
}
