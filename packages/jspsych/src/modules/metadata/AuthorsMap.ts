export class AuthorsMap {
  private authors: { [key: string]: {} | string }; // Define the type for authors

  constructor() {
    this.authors = {};
  }

  getList(): ({} | string)[] {
    const author_list = [];
    for (const key of Object.keys(this.authors)) {
      author_list.push(this.authors[key]);
    }
    return author_list;
  }

  // overwrites previous author when used
  setAuthor(fields: {
    type?: string;
    name: string;
    givenName?: string; // required
    familyName?: string;
    identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
  }): void {
    if (Object.keys(fields).length == 1) {
      // if only name, just add to list without dict format, according to documentation
      this.authors[fields.name] = fields.name;
      return;
    }

    const new_variable: { [key: string]: any } = {}; // Define an empty object to store the variables
    for (const key in fields) {
      // Check if the property is defined and not null
      if (fields[key] !== undefined && fields[key] !== null) {
        new_variable[key] = fields[key];
      }
    }

    this.authors[new_variable.name] = new_variable;
  }

  // lets you edit specific fields if you access it
  getAuthor(name: string): {} {
    if (name in this.authors) {
      return this.authors[name];
    } else return {};
  }
}
