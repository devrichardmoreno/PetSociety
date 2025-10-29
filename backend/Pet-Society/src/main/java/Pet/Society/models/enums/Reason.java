package Pet.Society.models.enums;

public enum Reason {
    CONTROL(15, "CONTROL"), EMERGENCY(15, "EMERGENCY"), VACCINATION(15, "VACCINATION"), NUTRITION(15, "NUTRITION");

    private final int duration;
    private final String reason;

    Reason(int duration, String reason) {
        this.duration = duration;
        this.reason = reason;
    }

    public int getDuration() {
        return duration;
    }

    public String getReason() {
        return reason;
    }
}
