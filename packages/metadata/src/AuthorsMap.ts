/**
 * Class that helps keep track of authors and allows for easy conversion to list format when
 * generating the final Metadata file.
 *
 * @export
 * @class AuthorsMap
 * @typedef {AuthorsMap}
 */
export class AuthorsMap {
  /**
   * Field that keeps track of the authors in a map.
   *
   * @private
   * @type {({ [key: string]: {} | string })}
   */
  private authors: { [key: string]: {} | string }; // Define the type for authors

  /**
   * Creates an empty instance of authors map. Doesn't generate default metadata because
   * can't assume anything about the authors.
   *
   * @constructor
   */
  constructor() {
    this.authors = {};
  }

  /**
   * Returns the final list format of the authors according to Psych-DS standards.
   *
   * @returns {({} | string)[]} - List of authors
   */
  getList(): ({} | string)[] {
    const author_list = [];
    for (const key of Object.keys(this.authors)) {
      author_list.push(this.authors[key]);
    }
    return author_list;
  }

  /**
   * Method that creates an author. This method can also be used to overwrite existing authors
   * with the same name in order to update fields.
   *
   * @param {{
   *     type?: string;
   *     name: string;
   *     givenName?: string; // required
   *     familyName?: string;
   *     identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
   *   }} fields - All the required or possible fields associated with listing an author according to Psych-DS standards.
   */
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
    const new_author: { [key: string]: any } = {}; // Define an empty object to store the variables
    new_author["name"] = fields["name"]; // to ensure that name is always first
    delete fields["name"];

    for (const key in fields) {
      // Check if the property is defined and not null
      if (fields[key] !== undefined && fields[key] !== null) {
        new_author[key] = fields[key];
      }
    }

    this.authors[new_author.name] = new_author;
  }

  /**
   * Method that fetches an author object allowing user to update (in existing workflow should not be necessary).
   *
   * @param {string} name - Name of author to be used as key.
   * @returns {{}} - Object with author information.
   */
  getAuthor(name: string): {} {
    if (name in this.authors) {
      return this.authors[name];
    } else return {};
  }
}
