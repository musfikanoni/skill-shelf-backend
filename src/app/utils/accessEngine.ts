// src/utils/accessEngine.ts

export const filterProductsByPlan = (products: any[], plan: any) => {
  const rule = plan?.accessRules?.products;

  if (!rule) return [];

  if (rule.type === "ALL") return products;

  if (rule.type === "LIMITED") {
    return products.filter((p) =>
      plan.allowedProducts?.some(
        (id: any) => id.toString() === p._id.toString()
      )
    );
  }

  return [];
};

export const filterCoursesByPlan = (courses: any[], plan: any) => {
  const rule = plan?.accessRules?.courses;

  if (!rule) return [];

  if (rule.type === "ALL") return courses;

  const allowed = plan.allowedCourses || [];

  const filtered = courses.filter((c) =>
    allowed.some((id: any) => id.toString() === c._id.toString())
  );

  return filtered.slice(0, rule.limit || filtered.length);
};