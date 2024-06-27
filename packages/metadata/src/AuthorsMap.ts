/**
 * Interface that defines the type for the fields that are specified for authors
 * according to Psych-DS regulations, with name being the one required field.
 *
 * @export
 * @interface AuthorFields
 * @typedef {AuthorFields}
 */
export interface AuthorFields {
  /** The type of the author. */
  "@type"?: string;
  /** The name of the author. (required) */
  name: string;
  /** The given name of the author. */
  givenName?: string;
  /** The family name of the author. */
  familyName?: string;
  /** The identifier that distinguishes the author across datasets (URL). */
  identifier?: string;
}

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
   * @type {({ [key: string]: AuthorFields | string })}
   */
  private authors: { [key: string]: AuthorFields | string };

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
   * @returns {(AuthorFields | string)[]} - List of authors
   */
  getList(): (AuthorFields | string)[] {
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
   * @param {AuthorFields | string} author - All the required or possible fields associated with listing an author according to Psych-DS standards. Option as a string to define an author according only to name.
   */
  setAuthor(author: AuthorFields | string): void {
    // Handling string input
    if (typeof author === "string") {
      this.authors[author] = author;
      return;
    }

    if (!author.name) {
      console.warn("Name field is missing. Author not added.");
      return;
    }

    const { name, ...rest } = author;

    if (Object.keys(rest).length == 0) {
      this.authors[name] = name;
    } else {
      const newAuthor: AuthorFields = { name, ...rest };
      this.authors[name] = newAuthor;

      const unexpectedFields = Object.keys(author).filter(
        (key) => !["@type", "name", "givenName", "familyName", "identifier"].includes(key)
      );
      if (unexpectedFields.length > 0) {
        console.warn(
          `Unexpected fields (${unexpectedFields.join(
            ", "
          )}) detected and included in the author object.`
        );
      }
    }
  }

  /**
   * Method that fetches an author object allowing user to update (in existing workflow should not be necessary).
   *
   * @param {string} name - Name of author to be used as key.
   * @returns {(AuthorFields | string | {})} - Object with author information. Empty object if not found.
   */
  getAuthor(name: string): AuthorFields | string | {} {
    if (name in this.authors) {
      return this.authors[name];
    } else {
      console.warn("Author (", name, ") not found.");
      return {};
    }
  }
}
