exports.updateSection = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;
    const { courseId, sectionId } = req.params;
    const { sectionName } = req.body;

    const instructor = await InstructorProfile.findOne({where: { userId}});
    if (!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const courses = await instructor.getCourses({ where: { courseId } });
    const course = courses[0];

    if (!course) {
        return next(new ErrorHandler("Course not found or does not belong to this user", 404));
    }

    const sections = await course.getSections({ where: { sectionId } });
    const section = sections[0];

    if (!section) {
        return next(new ErrorHandler("Section not found or does not belong to this course", 404));
    }

    section.sectionName = sectionName || section.sectionName;

    const updatedSection = await section.save();
    
    if (!updatedSection) {
        return next(new ErrorHandler("Failed to update section", 500));
    }

    res.status(200).json({ message: "Section updated successfully", section: updatedSection });
});