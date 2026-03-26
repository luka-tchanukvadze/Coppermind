import AppError from "./appError.js";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

// Prisma query object that gets passed to findMany()
interface PrismaQuery {
  where: Record<string, any>;
  orderBy: Record<string, string>[];
  select?: Record<string, boolean>;
  skip: number;
  take: number;
}

class APIFeatures {
  queryString: QueryString;
  prismaQuery: PrismaQuery;
  allowedFields: string[];

  constructor(queryString: QueryString, allowedFields: string[]) {
    this.queryString = queryString;
    this.allowedFields = allowedFields;

    // Initialize with empty defaults
    this.prismaQuery = {
      where: {},
      orderBy: [],
      skip: 0,
      take: 100,
    };
  }

  // Converts query params like ?progress=READING&isPrivate=true into Prisma where clauses
  // Supports operators: gte, gt, lte, lt → e.g. ?price[gte]=100
  filter(): APIFeatures {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    for (const field in queryObj) {
      if (!this.allowedFields.includes(field)) continue;

      if (typeof queryObj[field] === "object" && queryObj[field] !== null) {
        // Handle comparison operators: ?price[gte]=100 → { price: { gte: 100 } }
        const prismaOperators: Record<string, any> = {};
        for (const op in queryObj[field]) {
          if (["gte", "gt", "lte", "lt"].includes(op)) {
            prismaOperators[op] = isNaN(queryObj[field][op])
              ? queryObj[field][op]
              : Number(queryObj[field][op]);
          }
        }
        if (Object.keys(prismaOperators).length > 0) {
          this.prismaQuery.where[field] = prismaOperators;
        }
      } else {
        // Direct equality: ?progress=READING → { progress: "READING" }
        // Convert "true"/"false" strings to booleans for Prisma
        const value = queryObj[field];
        if (value === "true") this.prismaQuery.where[field] = true;
        else if (value === "false") this.prismaQuery.where[field] = false;
        else if (!isNaN(value)) this.prismaQuery.where[field] = Number(value);
        else this.prismaQuery.where[field] = value;
      }
    }

    return this;
  }

  // Converts ?sort=title,-createdAt into Prisma orderBy
  // Prefix with - for descending: -createdAt → { createdAt: "desc" }
  sort(): APIFeatures {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(",");

      this.prismaQuery.orderBy = sortFields.map((field) => {
        const direction = field.startsWith("-") ? "desc" : "asc";
        const cleanField = field.replace(/^-/, "");

        if (!this.allowedFields.includes(cleanField)) {
          throw new AppError(`Invalid sort field: ${cleanField}`, 400);
        }

        return { [cleanField]: direction };
      });
    } else {
      this.prismaQuery.orderBy = [{ createdAt: "desc" }];
    }

    return this;
  }

  // Converts ?fields=title,author into Prisma select
  // Only returns the specified fields (id is always included)
  fields(): APIFeatures {
    if (this.queryString.fields) {
      const requestedFields = this.queryString.fields.split(",");
      const select: Record<string, boolean> = { id: true };

      requestedFields.forEach((field) => {
        if (this.allowedFields.includes(field)) {
          select[field] = true;
        }
      });

      this.prismaQuery.select = select;
    }

    return this;
  }

  // Converts ?page=2&limit=10 into Prisma skip/take
  // Defaults: page 1, limit 100
  paginate(): APIFeatures {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    const limit = Math.max(1, Number(this.queryString.limit) || 20);

    this.prismaQuery.skip = (page - 1) * limit;
    this.prismaQuery.take = limit;

    return this;
  }

  // Returns the built query object - spread it into prisma.model.findMany()
  build(): PrismaQuery {
    return this.prismaQuery;
  }
}

export default APIFeatures;
